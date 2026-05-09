const crypto = require('crypto');

/**
 * Verify a Stripe webhook signature.
 * This is the 'Grounded' way to handle financial events.
 */
function verifyStripeSignature(payload, signature, secret) {
    const [timestampPart, signaturePart] = signature.split(',');
    const timestamp = timestampPart.split('=')[1];
    const actualSignature = signaturePart.split('=')[1];

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    if (actualSignature !== expectedSignature) {
        throw new Error('STRIPE_SIGNATURE_VERIFICATION_FAILED');
    }

    // Ensure timestamp is within a 5-minute window to prevent replay attacks
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
        throw new Error('STRIPE_TIMESTAMP_OUT_OF_RANGE');
    }

    return true;
}

module.exports = { verifyStripeSignature };
