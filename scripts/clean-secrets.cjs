// clean-secrets.cjs – removes backup/snapshot directories to guarantee no hard‑coded secrets remain
const { execSync } = require('child_process');
const dirs = [
  'XORAS_SOVEREIGN_CORE_MIRROR',
  'XORAS_SOVEREIGN_CORE_SAFE_BACKUP',
  'XORAS_SOVEREIGN_CORE_UPGRADE_SNAPSHOT'
];

try {
  dirs.forEach(d => {
    execSync(`rm -rf ${d}`, { stdio: 'ignore' });
    console.log(`✅ removed ${d}`);
  });
} catch (e) {
  console.error('⚠️ cleanup error', e.message);
  process.exit(1);
}
process.exit(0);
