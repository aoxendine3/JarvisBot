const fs = require('fs');
const path = require('path');

function getIgnoreList(dir) {
    const ignorePath = path.join(dir, '.env-integrity-ignore');
    return fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#')) : [];
}

const CLASSIFICATION = {
    runtime: ['PORT', 'DB_URL', 'HOST'],
    secrets: ['API_KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'CREDENTIAL'],
    optional: ['LOG_LEVEL', 'DEBUG']
};

function classify(key) {
    if (CLASSIFICATION.runtime.some(r => key.includes(r))) return 'Runtime';
    if (CLASSIFICATION.secrets.some(s => key.includes(s))) return 'Secret';
    if (CLASSIFICATION.optional.some(o => key.includes(o))) return 'Optional';
    return 'General';
}

module.exports = { getIgnoreList, classify };
