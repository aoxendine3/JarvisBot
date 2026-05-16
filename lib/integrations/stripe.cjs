const crypto = require('crypto');
const axios = require('axios'); // For V2 data pull

// Institutional Webhook Secrets
const WEBHOOK_SECRET_V1 = 'whsec_6xEpIocsKsrsiQuDpQnPxuBwFfeHTIyf';
const WEBHOOK_SECRET_V2 = 'whsec_OipADjFPeYivdI2seQbygtx3UHKaMhwa';

/**
 * Verify a Stripe webhook signature.
 * Supports dual-secret fallback for V1/V2 parity.
 */
function verifySignature(payload, signature) {
    let verified = false;
    
    // Attempt V1 Verification
    try {
        validate(payload, signature, WEBHOOK_SECRET_V1);
        return { version: 'V1', secret: WEBHOOK_SECRET_V1 };
    } catch (e) {
        // Fallback to V2 Verification
        validate(payload, signature, WEBHOOK_SECRET_V2);
        return { version: 'V2', secret: WEBHOOK_SECRET_V2 };
    }
}

function validate(payload, signature, secret) {
    const [timestampPart, signaturePart] = signature.split(',');
    const timestamp = timestampPart.split('=')[1];
    const actualSignature = signaturePart.split('=')[1];

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    if (actualSignature !== expectedSignature) {
        throw new Error('SIGNATURE_MISMATCH');
    }
}

/**
 * XORAS Fulfillment Orchestrator
 */
async function processEvent(payload) {
    const event = JSON.parse(payload);
    
    if (event.object === 'event') {
        // V1 SNAPSHOT
        console.log(`[XORAS] Processing V1 Snapshot: ${event.type}`);
        return await fulfill(event.data.object);
    } 
    
    if (event.object === 'v2.core.event') {
        // V2 THIN: Pull high-fidelity data
        console.log(`[XORAS] Processing V2 Thin: ${event.type}`);
        const response = await axios.get(`https://api.stripe.com${event.related_object.url}`, {
            headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
        });
        return await fulfill(response.data);
    }
}

async function fulfill(data) {
    // Fulfillment logic for XORAS Flagship Products
    console.log(`[XORAS] Fulfillment Logic Triggered for Object: ${data.id}`);
    // Update Resilience Ledger / Trigger SLE ingestion
    return true;
}

module.exports = { verifySignature, processEvent };
