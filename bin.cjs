#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;

let fileCount = 0;
const hardcodedSecrets = [];
const isJson = process.argv.includes('--json');
const isVerify = process.argv.includes('--verify');
const uploadIdx = process.argv.indexOf('--upload');
const uploadUrl = uploadIdx !== -1 ? process.argv[uploadIdx + 1] : null;

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

function getHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha1').update(content).digest('hex');
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
            console.error(`${colors.red}❌ Integrity Failure: ${fileName} has been modified.${colors.reset}`);
            failed = true;
        } else {
            console.log(`${colors.cyan}✅ Integrity Verified: ${fileName}${colors.reset}`);
        }
    });

    if (failed) process.exit(1);
    console.log(`\n${colors.cyan}Lock state verified.${colors.reset}`);
    process.exit(0);
}

if (isVerify) verifyLock();

function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const env = {};
    lines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = (match[2] || '').split(/\s+#/)[0].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

const SECRETS_REGEX = /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi;

function scanSource(dir, vars = new Set(), depth = 0) {
    if (depth > MAX_DEPTH || fileCount > MAX_FILE_COUNT) return vars;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.lstatSync(fullPath);

        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) {
            if (['node_modules', 'dist', 'build', '.next', '.git', '.cache', 'coverage'].includes(file)) continue;
            scanSource(fullPath, vars, depth + 1);
        } else if (file.match(/\.(tsx|jsx|js|ts|mjs|cjs)$/)) {
            if (stats.size > MAX_FILE_SIZE) continue;
            fileCount++;
            const content = fs.readFileSync(fullPath, 'utf8');
            
            const envMatches = content.matchAll(/process\.env(?:\.([A-Z_][A-Z0-9_]*)|\[['"]([A-Z_][A-Z0-9_]*)['"]\])/g);
            for (const match of envMatches) {
                vars.add(match[1] || match[2]);
            }

            const secretMatches = content.matchAll(SECRETS_REGEX);
            for (const match of secretMatches) {
                hardcodedSecrets.push({ file: fullPath.replace(process.cwd(), ''), preview: match[1].substring(0, 4) + '****' });
            }
        }
    }
    return vars;
}

function upload(url, data) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(data);
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            if (res.statusCode === 200) {
                console.log(`${colors.cyan}Result uploaded successfully.${colors.reset}`);
            } else {
                console.error(`${colors.red}Upload failed (Status: ${res.statusCode}).${colors.reset}`);
            }
            resolve();
        });
        req.on('error', (e) => {
            console.error(`${colors.red}Upload error: ${e.message}${colors.reset}`);
            resolve();
        });
        req.write(payload);
        req.end();
    });
}

async function run() {
    const targetDir = process.argv.filter(a => !a.startsWith('--'))[2] ? path.resolve(process.argv.filter(a => !a.startsWith('--'))[2]) : process.cwd();
    const examplePath = path.join(targetDir, '.env.example');
    const envPath = path.join(targetDir, '.env');

    if (!fs.existsSync(examplePath)) {
        console.error(`${colors.red}Error: .env.example missing.${colors.reset}`);
        process.exit(1);
    }

    const exampleEnv = parseEnv(examplePath);
    const activeEnv = parseEnv(envPath);
    const usedInCode = scanSource(targetDir);

    const missingButExpected = Object.keys(exampleEnv).filter(key => !(key in activeEnv));
    const missingInCode = Array.from(usedInCode).filter(key => !(key in activeEnv) && !(key in exampleEnv));
    const orphans = Object.keys(activeEnv).filter(key => !usedInCode.has(key) && !(key in exampleEnv));

    const result = {
        timestamp: new Date().toISOString(),
        repository: path.basename(targetDir),
        summary: {
            expected_missing: missingButExpected.length,
            unexpected_missing: missingInCode.length,
            secrets: hardcodedSecrets.length,
            orphans: orphans.length
        },
        details: {
            missingButExpected,
            missingInCode,
            hardcodedSecrets,
            orphans
        }
    };

    if (isJson) {
        console.log(JSON.stringify(result, null, 2));
    } else {
        if (missingButExpected.length > 0) {
            console.log(`\n${colors.yellow}Missing from .env (Defined in .env.example):${colors.reset}`);
            missingButExpected.forEach(k => console.log(`- ${k}`));
        }
        if (missingInCode.length > 0) {
            console.log(`\n${colors.red}Missing from all env files (Used in code):${colors.reset}`);
            missingInCode.forEach(k => console.log(`- ${k}`));
        }
        if (hardcodedSecrets.length > 0) {
            console.log(`\n${colors.red}Potential Secrets Found:${colors.reset}`);
            hardcodedSecrets.forEach(s => console.log(`- ${s.file} (${s.preview})`));
        }
        if (orphans.length > 0) {
            console.log(`\n${colors.yellow}Unused Variables:${colors.reset}`);
            orphans.forEach(k => console.log(`- ${k}`));
        }

        if (result.summary.unexpected_missing === 0 && result.summary.secrets === 0) {
            console.log(`\nAudit complete.`);
        } else {
            console.log(`\nAudit failed.`);
        }
    }

    if (uploadUrl) {
        await upload(uploadUrl, result);
    }

    const shouldFail = result.summary.unexpected_missing > 0 || result.summary.secrets > 0;
    process.exit(shouldFail ? 1 : 0);
}

run();