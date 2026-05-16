const crypto = require('crypto');

/**
 * XORAS Principal Signer (Institutional Standard)
 * Purpose: Provides cryptographically verifiable signatures for Audit Finality reports.
 */

class PrincipalSigner {
    constructor(secret = process.env.XORAS_PRINCIPAL_SECRET || 'institutional-baseline-secret') {
        this.secret = secret;
    }

    /**
     * Signs the audit payload using HMAC-SHA256
     * Format: base64(header).base64(payload).signature
     */
    sign(payload) {
        const header = { alg: 'HS256', typ: 'XORAS-AUDIT' };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        
        const hmac = crypto.createHmac('sha256', this.secret);
        hmac.update(`${encodedHeader}.${encodedPayload}`);
        const signature = hmac.digest('base64url');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    verify(token) {
        const [header, payload, signature] = token.split('.');
        const hmac = crypto.createHmac('sha256', this.secret);
        hmac.update(`${header}.${payload}`);
        const expectedSignature = hmac.digest('base64url');
        
        return signature === expectedSignature;
    }

    base64UrlEncode(str) {
        return Buffer.from(str).toString('base64url');
    }
}

module.exports = PrincipalSigner;
