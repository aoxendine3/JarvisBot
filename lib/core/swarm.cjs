/**
 * SOVEREIGN Swarm Orchestrator
 * Proactive Environment Monitoring & Policy Enforcement
 */
const { colors, t } = require('../utils.cjs');
const { scanSource } = require('./scanner.cjs');
const { audit } = require('./verifier.cjs');

async function initiateSwarm(targetDir, interval = 60000) {
    console.log(`${colors.cyan}--- SWARM INITIALIZED ---${colors.reset}`);
    console.log(`${colors.dim}Monitoring: ${targetDir}${colors.reset}`);
    console.log(`${colors.dim}Interval: ${interval}ms${colors.reset}\n`);

    setInterval(async () => {
        const timestamp = new Date().toLocaleTimeString();
        const { vars } = scanSource(targetDir);
        const { missingFromEnv, missingFromAll } = audit(targetDir, vars);
        
        const totalMissing = missingFromEnv.length + missingFromAll.length;
        
        if (totalMissing > 0) {
            console.log(`[${timestamp}] ${colors.red}❌ SWARM ALERT: Drift detected (${totalMissing} variables)${colors.reset}`);
            // In a real swarm, this would trigger an automated remediation or alert webhook
        } else {
            console.log(`[${timestamp}] ${colors.green}✅ SWARM STATUS: Apex Verified${colors.reset}`);
        }
    }, interval);
}

module.exports = { initiateSwarm };
