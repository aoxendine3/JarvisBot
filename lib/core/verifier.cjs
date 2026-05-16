/**
 * 🔬 XORAS // Institutional AST Verifier & FSM Tokenizer
 * Mandate: Absolute precision AST analysis, robust FSM environment tokenization, and strict runtime locking.
 * Permanent Rule: No bandaids, no wraps, no workarounds. First-principles engineering.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { classify } = require('./policy.cjs');

function getHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * First-Principles FSM Tokenizer for Environment Files.
 * Reliably parses complex values, escaped strings, and inline comments without fragile regex truncation.
 */
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;

        const key = line.slice(0, eqIdx).trim();
        let valRaw = line.slice(eqIdx + 1).trim();

        if (valRaw.startsWith('"') || valRaw.startsWith("'")) {
            const quoteChar = valRaw[0];
            let val = '';
            let isEscaped = false;
            let closedQuoteIdx = -1;

            for (let j = 1; j < valRaw.length; j++) {
                const char = valRaw[j];
                if (isEscaped) {
                    val += char;
                    isEscaped = false;
                } else if (char === '\\') {
                    isEscaped = true;
                } else if (char === quoteChar) {
                    closedQuoteIdx = j;
                    break;
                } else {
                    val += char;
                }
            }
            if (closedQuoteIdx !== -1) {
                env[key] = val;
            } else {
                env[key] = valRaw;
            }
        } else {
            // Unquoted value: respect comments that follow whitespace
            let commentIdx = valRaw.indexOf(' #');
            if (commentIdx === -1) commentIdx = valRaw.indexOf('\t#');
            if (commentIdx !== -1) {
                valRaw = valRaw.slice(0, commentIdx).trim();
            }
            env[key] = valRaw;
        }
    }
    return env;
}

function audit(dir, sourceVars) {
    const envPath = path.join(dir, '.env');
    const examplePath = path.join(dir, '.env.example');

    const current = fs.existsSync(envPath) ? parseEnv(envPath) : {};
    const example = fs.existsSync(examplePath) ? parseEnv(examplePath) : {};

    const missingFromEnv = [];
    const missingFromAll = [];

    for (const key in example) {
        if (!(key in current)) {
            missingFromEnv.push({ key, type: classify(key), class: 'expected but unset' });
        }
    }

    for (const key of sourceVars) {
        if (!(key in current) && !(key in example)) {
            missingFromAll.push({ key, type: classify(key), class: 'undocumented risk' });
        }
    }

    return { missingFromEnv, missingFromAll, activeEnv: current, exampleEnv: example };
}

function auditRuntime(lockPath) {
    if (!fs.existsSync(lockPath)) return { success: false, reason: 'LOCK_MISSING' };

    const lockContent = fs.readFileSync(lockPath, 'utf8');
    const lockMap = new Map();
    const lines = lockContent.split(/\r?\n/).filter(l => l.trim());

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const spaceIdx = line.indexOf(' ');
        if (spaceIdx !== -1) {
            const hash = line.slice(0, spaceIdx).trim();
            const fileName = line.slice(spaceIdx + 1).trim();
            lockMap.set(path.resolve(fileName), hash);
        }
    }

    const runtimeModules = Object.keys(require.cache);
    const violations = [];

    for (let i = 0; i < runtimeModules.length; i++) {
        const modPath = runtimeModules[i];
        if (modPath.includes('node_modules') || !modPath.startsWith(process.cwd())) continue;

        const currentHash = getHash(modPath);
        const expectedHash = lockMap.get(modPath);

        if (expectedHash && currentHash !== expectedHash) {
            violations.push({ file: path.relative(process.cwd(), modPath), expected: expectedHash, actual: currentHash });
        }
    }

    return { success: violations.length === 0, violations };
}

module.exports = { getHash, parseEnv, audit, auditRuntime };
