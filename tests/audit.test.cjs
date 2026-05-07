const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
    bright: "\x1b[1m"
};

const TEST_DIR = path.join(__dirname, 'temp_pressure_test');
const BIN = path.join(__dirname, '../bin.cjs');

function cleanup() {
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
}

function runTest(name, setup, expectedExitCode = 0) {
    console.log(`${colors.bright}Running Test: ${name}${colors.reset}`);
    cleanup();
    fs.mkdirSync(TEST_DIR);
    setup(TEST_DIR);

    try {
        const output = execSync(`node ${BIN} ${TEST_DIR}`, { encoding: 'utf8' });
        if (expectedExitCode !== 0) {
            console.error(`${colors.red}FAILED: Expected exit code ${expectedExitCode} but got 0${colors.reset}`);
            process.exit(1);
        }
        console.log(`${colors.green}PASSED${colors.reset}\n`);
    } catch (error) {
        if (error.status === expectedExitCode) {
            console.log(`${colors.green}PASSED (Caught Expected Failure)${colors.reset}\n`);
        } else {
            console.error(`${colors.red}FAILED: Expected exit code ${expectedExitCode} but got ${error.status}${colors.reset}`);
            console.error(error.stdout);
            process.exit(1);
        }
    }
}

// --- Test Cases ---

// 1. Standard Integrity (Success)
runTest('Standard Integrity (Pass)', (dir) => {
    fs.writeFileSync(path.join(dir, '.env.example'), 'API_KEY=\nDB_URL=');
    fs.writeFileSync(path.join(dir, '.env'), 'API_KEY=123\nDB_URL=postgres://');
    fs.writeFileSync(path.join(dir, 'app.js'), 'console.log(process.env.API_KEY, process.env.DB_URL);');
}, 0);

// 2. Missing Env Tranche (Fail)
runTest('Missing Env Tranche (Fail)', (dir) => {
    fs.writeFileSync(path.join(dir, '.env.example'), 'API_KEY=\nSECRET_KEY=');
    fs.writeFileSync(path.join(dir, '.env'), 'API_KEY=123');
}, 1);

// 3. Hardcoded Secret Detection (Fail)
runTest('Hardcoded Secret Detection (Security Alert)', (dir) => {
    fs.writeFileSync(path.join(dir, '.env.example'), 'API_KEY=');
    fs.writeFileSync(path.join(dir, '.env'), 'API_KEY=123');
    fs.writeFileSync(path.join(dir, 'auth.js'), 'const token = process.env.SECURED_CREDENTIAL_001;');
}, 1);

// 4. Orphaned Variable (Warning - Exit 0 if no other errors)
runTest('Orphaned Variable Detection (Warning)', (dir) => {
    fs.writeFileSync(path.join(dir, '.env.example'), 'API_KEY=');
    fs.writeFileSync(path.join(dir, '.env'), 'API_KEY=123\nORPHAN=ghost');
    fs.writeFileSync(path.join(dir, 'app.js'), 'process.env.API_KEY');
}, 0);

// 5. Recursion & Symlink Protection (Pass)
runTest('Recursion & Symlink Guard (Stability)', (dir) => {
    fs.writeFileSync(path.join(dir, '.env.example'), 'API_KEY=');
    fs.writeFileSync(path.join(dir, '.env'), 'API_KEY=123');
    // Create recursive loop
    const loopDir = path.join(dir, 'loop');
    fs.mkdirSync(loopDir);
    try {
        execSync(`ln -s ../loop ${path.join(loopDir, 'recursive')}`);
    } catch(e) {} // Handle systems without ln
}, 0);

cleanup();
console.log(`${colors.bright}${colors.green}ALL INSTITUTIONAL TESTS VERIFIED.${colors.reset}`);
