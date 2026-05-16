const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.resolve(__dirname, '../../.xoras_session');

function getSessionId() {
    if (fs.existsSync(SESSION_FILE)) {
        return fs.readFileSync(SESSION_FILE, 'utf8').trim();
    }
    const id = randomUUID();
    fs.writeFileSync(SESSION_FILE, `${id}\n`, { mode: 0o600 });
    return id;
}

module.exports = {
    SESSION_ID: getSessionId()
};
