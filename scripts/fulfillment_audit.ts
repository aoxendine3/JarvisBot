
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const DB_PATH = './vanguard_fulfillment.db';
const LOG_DIR = './logs';
const LOG_FILE = `${LOG_DIR}/email_outbox.log`;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

async function fulfillOrder(stripeSessionId: string, customerEmail: string) {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    
    // 1. IDEMPOTENCY CHECK
    const existing = await db.get('SELECT * FROM licenses WHERE stripe_session_id = ?', [stripeSessionId]);
    if (existing) return { status: 'IDEMPOTENT', key: existing.license_key };

    // 2. GENERATE & PERSIST
    const key = `VNG-${uuidv4().substring(0, 8).toUpperCase()}`;
    await db.run(
        'INSERT INTO licenses (id, stripe_session_id, license_key, customer_email, product_name, status) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), stripeSessionId, key, customerEmail, 'Sovereign Blueprint', 'delivered']
    );

    // 3. LOG MOCK EMAIL
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] TO: ${customerEmail} | KEY: ${key}\n`);
    
    return { status: 'NEW_DELIVERY', key };
}

async function runAudit() {
    console.log('--- STARTING FULFILLMENT AUDIT ---');
    
    // Test 1: First Purchase
    const t1 = await fulfillOrder('session_001', 'alice@example.com');
    console.log(`FT-001: ${JSON.stringify(t1)}`);

    // Test 2: Duplicate Purchase (Same Session)
    const t2 = await fulfillOrder('session_001', 'alice@example.com');
    console.log(`FT-002: ${JSON.stringify(t2)}`);

    // Test 3: Same Session, Different Email (System Constraint Check)
    const t3 = await fulfillOrder('session_001', 'bob@example.com');
    console.log(`FT-003: ${JSON.stringify(t3)}`);

    // Test 4: New Purchase
    const t4 = await fulfillOrder('session_002', 'charlie@example.com');
    console.log(`FT-004: ${JSON.stringify(t4)}`);

    console.log('--- AUDIT COMPLETE ---');
}

runAudit().catch(console.error);
