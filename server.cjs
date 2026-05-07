const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/upload') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const filename = `audit_${data.repository}_${Date.now()}.json`;
                fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
                console.log(`Report received: ${filename}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', saved: filename }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Data Collector running on http://localhost:${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}/api/upload`);
});
