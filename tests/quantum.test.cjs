const fs = require('fs');
const path = require('path');
const quantumSentry = require('../lib/core/quantum_sentry.cjs');

console.log("--- TESTING SOVEREIGN QUANTUM SENTRY ---");

const testDir = path.join(__dirname, 'tmp_quantum');
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(testDir);

fs.writeFileSync(path.join(testDir, 'index.js'), 'console.log("secure");');
fs.writeFileSync(path.join(testDir, 'config.json'), '{"key":"val"}');

const manifest = quantumSentry.buildSovereignManifest(testDir);
console.log(`✅ Sovereign Manifest Root Hash: ${manifest.rootHash.slice(0, 32)}...`);
console.log(`✅ Total Nodes Attested: ${manifest.totalNodes}`);

const verifyClean = quantumSentry.verifyManifest(testDir, manifest);
if (verifyClean.verified) {
    console.log("✅ Verification successful: Zero configuration drift detected.");
} else {
    console.error("❌ Verification failed unexpectedly.");
    process.exit(1);
}

// Introduce tamper
fs.writeFileSync(path.join(testDir, 'index.js'), 'console.log("tampered");');
const verifyTampered = quantumSentry.verifyManifest(testDir, manifest);

if (!verifyTampered.verified && verifyTampered.violations.length === 1) {
    console.log(`✅ Tamper successfully trapped: ${verifyTampered.violations[0].file} -> Actual Signature Mismatch`);
} else {
    console.error("❌ Failed to trap tampered node.");
    process.exit(1);
}

fs.rmSync(testDir, { recursive: true, force: true });
console.log("--- QUANTUM SENTRY VERIFIED PASSED ---");
