const core = require('@actions/core');
const { execSync } = require('child_process');
const path = require('path');
const OIDCSigner = require('./lib/oidc_signer');

/**
 * XORAS Governance Action (L5 Production)
 * Purpose: Automated CI release integrity with OIDC attestation.
 */

async function run() {
    try {
        console.log("🔒 XORAS: Initiating Institutional Release Governance...");

        // 1. OIDC Identity Acquisition
        const oidc = new OIDCSigner();
        const token = await oidc.acquireToken();

        // 2. Execute Hardened Local Audit
        console.log("🔍 XORAS: Executing Deterministic Scoped-Audit...");
        const auditScript = path.join(__dirname, '../../scripts/local_audit.js');
        
        try {
            const oidcFlag = token ? `--oidc-token=${token}` : '';
            execSync(`node ${auditScript} ${oidcFlag}`, { stdio: 'inherit' });
            console.log("✅ XORAS: Integrity Audit Passed.");
        } catch (error) {
            core.setFailed("❌ XORAS: Release Integrity Violation Detected.");
        }

    } catch (error) {
        core.setFailed(`❌ XORAS: Institutional Failure - ${error.message}`);
    }
}

run();
