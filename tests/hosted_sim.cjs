/**
 * Deployment Safety: Hosted Telemetry Simulation
 * Purpose: Verify distributed report transmission.
 * Domain: B (Dev Orchestration)
 */
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.headers['content-type'] === 'application/json') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            console.log('\n[SIM SERVER] Received Audit Report:');
            console.log(JSON.parse(body).summary);
            res.writeHead(201);
            res.end('Report Received');
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(8081, () => {
    console.log('[SIM SERVER] Telemetry mock online at http://localhost:8081');
});

setTimeout(() => {
    console.log('[SIM SERVER] Simulation complete. Shutting down.');
    server.close();
}, 5000);
