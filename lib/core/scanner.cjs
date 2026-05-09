const fs = require('fs');
const path = require('path');
const { getIgnoreList } = require('./policy.cjs');

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;
const SECRETS_REGEX = /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi;

let fileCount = 0;

function scanSource(dir, vars = new Set(), hardcodedSecrets = [], depth = 0) {
    if (depth > MAX_DEPTH || fileCount > MAX_FILE_COUNT) return { vars, hardcodedSecrets };
    
    const ignored = getIgnoreList(dir);

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignored.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stats = fs.lstatSync(fullPath);

        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) {
            const allowed = ['src', 'xoras'];
            if (!allowed.includes(file) && depth === 0) continue;
            if (['node_modules', 'dist', 'build', '.next', '.git', '.cache', 'coverage', 'sandbox', 'infra', 'tests', 'out'].includes(file)) continue;
            scanSource(fullPath, vars, hardcodedSecrets, depth + 1);
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
                hardcodedSecrets.push({ file: fullPath.replace(process.cwd(), '') });
            }
        }
    }
    return { vars, hardcodedSecrets };
}

module.exports = { scanSource };
