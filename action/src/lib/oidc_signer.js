const core = require('@actions/core');

/**
 * XORAS OIDC Signer (Institutional Standard)
 * Purpose: Acquires and validates OIDC identity tokens for CI workload attestation.
 */

class OIDCSigner {
    constructor(issuer = "https://token.actions.githubusercontent.com") {
        this.issuer = issuer;
    }

    /**
     * Acquires the OIDC ID Token from the GitHub Actions runner.
     * Requires 'permissions: id-token: write' in the workflow.
     */
    async acquireToken(audience = "https://github.com/aoxendine3/xoras") {
        try {
            console.log(`🔐 XORAS: Requesting OIDC token from ${this.issuer}...`);
            const token = await core.getIDToken(audience);
            console.log("✅ XORAS: OIDC Workload Identity Acquired.");
            return token;
        } catch (error) {
            console.warn(`⚠️  XORAS: OIDC Acquisition Failed - ${error.message}`);
            return null;
        }
    }

    /**
     * Formats the OIDC token as a Principal Authority claim.
     */
    formatAttestation(token, findings) {
        if (!token) return null;

        return {
            attestation_type: "OIDC-WORKLOAD-IDENTITY",
            issuer: this.issuer,
            timestamp: new Date().toISOString(),
            findings_count: findings.length,
            veracity_score: this.calculateVeracity(findings),
            identity_proof: token // This is the raw JWT from the runner
        };
    }

    calculateVeracity(findings) {
        if (findings.length === 0) return 1.0;
        const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
        return Math.max(0, 1.0 - (criticals * 0.2));
    }
}

module.exports = OIDCSigner;
