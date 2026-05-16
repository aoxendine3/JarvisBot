#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const { colors, t } = require('../lib/utils.cjs');
const { scanSource } = require('../lib/core/scanner.cjs');
const { getHash, parseEnv, audit, auditRuntime } = require('../lib/core/verifier.cjs');
const { initiateSwarm } = require('../lib/core/swarm.cjs');
const { transmitReport } = require('../lib/core/collector.cjs');

const isVerify = process.argv.includes('--verify');
const isNoVerify = process.argv.includes('--no-verify');
const isSwarm = process.argv.includes('--swarm');
const isRuntime = process.argv.includes('--runtime');
const isLock = process.argv.includes('--lock');
const isReport = process.argv.includes('--report');
const uploadIdx = process.argv.indexOf('--upload');
const uploadUrl = uploadIdx !== -1 ? process.argv[uploadIdx + 1] : null;

async function generateLock() {
    const files = [
        'bin/env-integrity-sentry.cjs',
        'lib/core/scanner.cjs',
        'lib/core/verifier.cjs',
        'lib/core/swarm.cjs',
        'lib/core/policy.cjs',
        'lib/core/collector.cjs',
        'lib/utils.cjs'
    ];
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    const lines = files.map(f => {
        const fullPath = path.join(process.cwd(), f);
        if (fs.existsSync(fullPath)) {
            return `${getHash(fullPath)} ${f}`;
        }
        return null;
    }).filter(Boolean);
    fs.writeFileSync(lockPath, lines.join('\n') + '\n');
    console.log(`${colors.green}✅ ${t('lock_generated') || 'Integrity lock generated.'}${colors.reset}`);
    process.exit(0);
}

async function verifyLock() {
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    if (!fs.existsSync(lockPath)) {
        console.error(`${colors.red}Error: integrity.lock missing.${colors.reset}`);
        process.exit(1);
    }
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    const lines = lockContent.split(/\r?\n/).filter(l => l.trim());
    let failed = false;

    lines.forEach(line => {
        const [expectedHash, fileName] = line.split(/\s+/);
        const currentHash = getHash(path.join(process.cwd(), fileName));
        if (currentHash !== expectedHash) {
            console.error(`${colors.red}❌ ${t('integrity_failure', { file: fileName })}${colors.reset}`);
            failed = true;
        } else {
            console.log(`${colors.cyan}✅ ${t('integrity_verified')} ${fileName}${colors.reset}`);
        }
    });

    if (failed) process.exit(2); // Integrity Failure
    console.log(`\n${colors.cyan}${t('lock_verified') || 'Integrity lock verified.'}${colors.reset}`);
    process.exit(0);
}

if (isLock) generateLock();
if (isVerify) verifyLock();

async function verifyRuntime() {
    console.log(`${colors.dim}--- RUNTIME INTEGRITY AUDIT ---${colors.reset}`);
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    const result = audit(path.resolve('.'), new Set()); // Warm up scanner
    const runtimeAudit = auditRuntime(lockPath);
    
    if (runtimeAudit.reason === 'LOCK_MISSING') {
        console.error(`${colors.red}Error: integrity.lock missing. Run with --lock to generate.${colors.reset}`);
        process.exit(1);
    }

    if (!runtimeAudit.success) {
        console.error(`${colors.red}❌ Runtime Identity Violation Detected!${colors.reset}`);
        runtimeAudit.violations.forEach(v => {
            console.log(`  [-] ${v.file}`);
            console.log(`      Expected: ${v.expected}`);
            console.log(`      Actual:   ${v.actual}`);
        });
        process.exit(3); // Configuration Drift
    }

    console.log(`${colors.green}✅ All active modules verifiably secured.${colors.reset}`);
    process.exit(0);
}

if (isRuntime) {
    verifyRuntime();
    return;
}

function upload(url, data) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(data);
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        }, (res) => {
            if (res.statusCode === 200) console.log(`${colors.cyan}Result uploaded.${colors.reset}`);
            resolve();
        });
        req.on('error', () => resolve());
        req.write(payload);
        req.end();
    });
}

async function scanForSecrets(dir) {
    const SECRET_PATTERNS = [
        /SG\.[a-zA-Z0-9_-]{20,}/g, // SendGrid
        /AKIA[a-zA-Z0-9]{16}/g,     // AWS
        /sk-[a-zA-Z0-9]{20,}/g,     // OpenAI
        /AIza[a-zA-Z0-9_-]{35}/g,   // Google
        /PRIVATE KEY/gi,            // Generic Private Key
        /API_KEY\s*=\s*['"][a-zA-Z0-9_-]{20,}['"]/gi // Generic API Key Assignment
    ];

    const getFiles = (dir) => {
        let results = [];
        if (!fs.existsSync(dir)) return results;
        const exclusions = ['node_modules', '.git', '.terraform', '.next', '.open-next', 'dist', 'out'];
        if (exclusions.some(exc => dir.includes(exc))) return results;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            try {
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getFiles(file));
                } else {
                    // Ignore binaries, large assets, and documentation for critical secret scans
                    const isBinary = file.match(/\.(bin|exe|png|jpg|jpeg|gif|ico|pdf|zip|gz|tar|tgz|x5|dylib|so|dll)$/i);
                    const isDoc = file.match(/\.(md|txt|pdf)$/i);
                    if (!isBinary && !isDoc) results.push(file);
                }
            } catch (e) {}
        });
        return results;
    };

    const scanFile = (file) => {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(file, { encoding: 'utf8', highWaterMark: 64 * 1024 });
            let partialMatch = '';
            let foundLeaks = [];

            stream.on('data', (chunk) => {
                const content = partialMatch + chunk;
                SECRET_PATTERNS.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        foundLeaks = foundLeaks.concat(matches);
                    }
                });
                // Keep the last 100 chars to handle patterns split across chunks
                partialMatch = content.slice(-100);
            });

            stream.on('end', () => {
                if (foundLeaks.length > 0) {
                    resolve({ file, matches: [...new Set(foundLeaks)] });
                } else {
                    resolve(null);
                }
            });

            stream.on('error', () => resolve(null));
        });
    };

    const files = getFiles(dir);
    const results = await Promise.all(files.map(file => {
        if (file.includes('node_modules') || file.includes('.git')) return null;
        if (file === __filename) return null;
        return scanFile(file);
    }));

    return results.filter(Boolean);
}

async function run() {
    const targetDir = process.argv.filter(a => !a.startsWith('--'))[2] ? path.resolve(process.argv.filter(a => !a.startsWith('--'))[2]) : process.cwd();

    const leaks = await scanForSecrets(targetDir);
    if (leaks.length > 0) {
        console.error('\n❌ CRITICAL: HARDCODED SECRETS DETECTED:');
        leaks.forEach(l => console.error(` - ${l.file}: [${l.matches.join(', ')}]`));
        process.exit(1);
    }

    if (isSwarm) {
        await initiateSwarm(targetDir);
        return;
    }

    if (!isNoVerify) {
        // Run verification before audit unless bypassed
        const lockPath = path.join(process.cwd(), 'integrity.lock');
        if (fs.existsSync(lockPath)) {
            const lockContent = fs.readFileSync(lockPath, 'utf8');
            const lines = lockContent.split(/\r?\n/).filter(l => l.trim());
            for (const line of lines) {
                const [expectedHash, fileName] = line.split(/\s+/);
                const currentHash = getHash(path.join(process.cwd(), fileName));
                if (currentHash !== expectedHash) {
                    console.error(`${colors.red}❌ ${t('integrity_failure', { file: fileName })}${colors.reset}`);
                    process.exit(2);
                }
            }
        }
    }

    const { vars, hardcodedSecrets, asyncParamsDrift } = scanSource(targetDir);
    const { missingFromEnv, missingFromAll, activeEnv, exampleEnv } = audit(targetDir, vars);
    
    // Filter framework and internal noise
    const filteredMissingFromAll = missingFromAll.filter(m => 
        !m.key.startsWith('NEXT_') && 
        !m.key.startsWith('__NEXT_') && 
        !m.key.startsWith('AWS_SDK_') &&
        !m.key.startsWith('CIRCLE_') &&
        !['NODE_ENV', 'C', 'PORT', 'HOST'].includes(m.key)
    );

    const orphans = Object.keys(activeEnv).filter(key => !vars.has(key) && !(key in exampleEnv));

    if (asyncParamsDrift && asyncParamsDrift.length > 0) {
        console.log(`\n${colors.red}❌ NEXT.JS 15 BREAKING CHANGE DETECTED: Synchronous Dynamic Route Params Drift${colors.reset}`);
        asyncParamsDrift.forEach(m => console.log(`  [-] ${m.file} -> ${m.match}`));
    }

    if (missingFromEnv.length > 0) {
        console.log(`\n${colors.yellow}${t('expected_but_unset')}${colors.reset}`);
        missingFromEnv.forEach(m => console.log(`- ${m.key} [${m.type}]`));
    }

    if (filteredMissingFromAll.length > 0) {
        console.log(`\n${colors.red}${t('undocumented_risks')}${colors.reset}`);
        filteredMissingFromAll.forEach(m => console.log(`- ${m.key} [${m.type}]`));
    }

    const totalMissing = missingFromEnv.length + filteredMissingFromAll.length + (asyncParamsDrift ? asyncParamsDrift.length : 0);
    if (totalMissing > 0) {
        console.log(`\n${colors.red}${t('audit_failed', { count: totalMissing })}${colors.reset}`);
    } else {
        console.log(`\n${colors.green}${t('audit_passed')}${colors.reset}`);
    }

    const result = {
        timestamp: new Date().toISOString(),
        summary: { unexpected_missing: totalMissing, secrets: hardcodedSecrets.length, orphans: orphans.length, async_params_drift: asyncParamsDrift ? asyncParamsDrift.length : 0 },
        findings: { missingFromEnv, missingFromAll, hardcodedSecrets, orphans, asyncParamsDrift }
    };

    // Save report for dashboard telemetry
    fs.writeFileSync(path.join(__dirname, '../audit_report.json'), JSON.stringify(result, null, 2));

    if (process.argv.includes('--report')) {
        console.log(`\n${colors.dim}--- JSON REPORT ---${colors.reset}`);
        console.log(JSON.stringify(result, null, 2));
    }

    if (uploadUrl) {
        try {
            await transmitReport(uploadUrl, result);
            console.log(`${colors.cyan}Audit report transmitted to telemetry server.${colors.reset}`);
        } catch (e) {
            console.error(`${colors.red}Telemetry transmission failed: ${e.message}${colors.reset}`);
        }
    }

    const isDrifted = totalMissing > 0 || hardcodedSecrets.length > 0 || orphans.length > 0;
    process.exit(isDrifted ? 1 : 0);
}

run();