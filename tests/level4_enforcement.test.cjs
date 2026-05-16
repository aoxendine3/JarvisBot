/**
 * Deployment Safety: Level 4 Enforcement Audit
 * Purpose: Verify deterministic exit codes for CI/CD gating.
 * Domain: B (Dev Orchestration)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runEnforcementAudit() {
    console.log('--- STARTING LEVEL 4 ENFORCEMENT AUDIT ---');
    const binPath = path.resolve('./bin/env-integrity-sentry.cjs');
    const tmpBase = path.resolve('./tests/tmp_enforcement');
    
    if (fs.existsSync(tmpBase)) fs.rmSync(tmpBase, { recursive: true, force: true });
    fs.mkdirSync(tmpBase, { recursive: true });

    // 1. Verify Pass Condition (Code 0)
    try {
        const passDir = path.join(tmpBase, 'pass_project');
        fs.mkdirSync(passDir);
        fs.writeFileSync(path.join(passDir, 'index.js'), 'console.log(process.env.VAR1)');
        fs.writeFileSync(path.join(passDir, '.env'), 'VAR1=test');
        fs.writeFileSync(path.join(passDir, '.env.example'), 'VAR1=');

        console.log('\n[TEST 1] Verifying Clean Audit (Code 0)...');
        execSync(`node ${binPath} ${passDir} --no-verify`, { stdio: 'ignore' });
        console.log('✅ TEST 1 PASSED: Correctly exited with 0.');
    } catch (e) {
        console.log(`❌ TEST 1 FAILED: Exited with ${e.status} instead of 0.`);
    }

    // 2. Verify Drift Gating (Code 1)
    try {
        const driftDir = path.join(tmpBase, 'drift_project');
        fs.mkdirSync(driftDir);
        fs.writeFileSync(path.join(driftDir, 'index.js'), 'console.log(process.env.VAR1)');
        fs.writeFileSync(path.join(driftDir, '.env'), ''); // Missing VAR1
        fs.writeFileSync(path.join(driftDir, '.env.example'), 'VAR1=');

        console.log('\n[TEST 2] Verifying Drift Gating (Code 1)...');
        execSync(`node ${binPath} ${driftDir} --no-verify`, { stdio: 'ignore' });
        console.log('❌ TEST 2 FAILED: Should have exited with 1.');
    } catch (e) {
        if (e.status === 1) {
            console.log('✅ TEST 2 PASSED: Correctly gated drift with Exit Code 1.');
        } else {
            console.log(`❌ TEST 2 FAILED: Exited with ${e.status} instead of 1.`);
        }
    }

    // 3. Verify Apex Gating (Code 2)
    try {
        const apexDir = path.join(tmpBase, 'apex_project');
        fs.mkdirSync(apexDir);
        fs.writeFileSync(path.join(apexDir, 'index.js'), 'console.log("secure")');
        
        // Generate a lock in a different place to avoid messing with real one
        const fakeLock = path.join(apexDir, 'integrity.lock');
        fs.writeFileSync(fakeLock, 'INVALID_HASH bin/env-integrity-sentry.cjs\n');
        
        console.log('\n[TEST 3] Verifying Apex Failure (Code 2)...');
        // We need to run from apexDir so it finds the local integrity.lock
        execSync(`node ${binPath} ${apexDir}`, { stdio: 'ignore', cwd: apexDir });
        console.log('❌ TEST 3 FAILED: Should have exited with 2.');
    } catch (e) {
        if (e.status === 2) {
            console.log('✅ TEST 3 PASSED: Correctly gated integrity failure with Exit Code 2.');
        } else {
            console.log(`❌ TEST 3 FAILED: Exited with ${e.status} instead of 2.`);
        }
    }

    // Cleanup
    fs.rmSync(tmpBase, { recursive: true, force: true });
    console.log('\n--- AUDIT COMPLETE ---');
}

runEnforcementAudit();
