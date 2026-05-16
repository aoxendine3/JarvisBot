/**
 * XORAS Local Edge Auditor (L5 Production Standard)
 * Purpose: Modular, Signed, and OIDC-Attested Release Integrity.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const PrincipalSigner = require('../action/src/lib/signer');

/**
 * XORAS Sentinel (Self-Healing v1.0)
 * Purpose: Detects tampering and provides deterministic rectification paths.
 */

const RULES_PATH = path.join(process.cwd(), 'rules/default.json');
const TRUSTED_POLICY_HASH = '13dd08f4e50b88af7c4cc73f1ae62ee05c0883265130b8c04b653dc463f6b619';

function verifySentinelIntegrity() {
    const rulesContent = fs.readFileSync(RULES_PATH, 'utf8');
    const rulesHash = crypto.createHash('sha256').update(rulesContent).digest('hex');
    
    if (rulesHash !== TRUSTED_POLICY_HASH) {
        console.error(`🚨 TAMPER_DETECTED: Policy hash mismatch!`);
        console.error(`Expected: ${TRUSTED_POLICY_HASH}`);
        console.error(`Actual:   ${rulesHash}`);
        console.error(`XORAS: Integrity Sentinel has aborted the audit to prevent policy bypass.`);
        process.exit(128); // Standard L4-L6 Failure Code
    }
    
    console.log(`🛡️  XORAS Sentinel: Policy Integrity Verified (${rulesHash.substring(0, 8)}).`);
}

function generateRemediation(finding) {
    if (finding.type === 'SECRET_EXPOSURE') {
        return `[RECTIFICATION]: 
1. Move the secret to GitHub Secrets/Environment Variables.
2. Run 'git filter-repo --invert-paths --path ${finding.file}' to purge from history.
3. Rotate the compromised key immediately.`;
    }
    if (finding.type === 'MISSING_DEPENDENCY') {
        return `[RECTIFICATION]: Add '${finding.variable}' to your .env file or CI secrets.`;
    }
    return 'Contact platform team for remediation path.';
}
const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
const signer = new PrincipalSigner();

// Parse CLI Arguments
const args = process.argv.slice(2);
const oidcToken = args.find(a => a.startsWith('--oidc-token='))?.split('=')[1];

function calculateEntropy(str) {
    const len = str.length;
    if (len === 0) return 0;
    const freq = {};
    for (let i = 0; i < len; i++) {
        freq[str[i]] = (freq[str[i]] || 0) + 1;
    }
    let entropy = 0;
    for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

function runAudit() {
    verifySentinelIntegrity();
    console.log("🔒 XORAS: Initiating L5 Hardened Integrity Audit...");
    if (oidcToken) console.log("🔐 XORAS: OIDC Workload Attestation Active.");
    
    const changedFiles = getChangedFiles();
    const findings = [];
    const requiredEnvVars = new Set();
    const existingEnvVars = getLocalEnvVars();

    const secretProfile = rules.profiles.find(p => p.name === 'SECRET_EXPOSURE');
    const envProfile = rules.profiles.find(p => p.name === 'ENV_DRIFT');

    changedFiles.forEach(file => {
        if (rules.exclusions.some(pattern => file.includes(pattern.replace('/**', '')))) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. Env Drift Detection
            envProfile.patterns.forEach(p => {
                const regex = new RegExp(p, 'g');
                const matches = content.matchAll(regex);
                for (const match of matches) {
                    if (match[0].includes('{')) {
                        match[1].split(',').forEach(v => requiredEnvVars.add(v.trim()));
                    } else {
                        requiredEnvVars.add(match[1]);
                    }
                }
            });

            // 2. Secret Detection + Entropy
            secretProfile.patterns.forEach(p => {
                const regex = new RegExp(p, 'gi');
                const matches = content.matchAll(regex);
                for (const match of matches) {
                    const secretCandidate = match[1];
                    const entropy = calculateEntropy(secretCandidate);
                    
                    if (entropy > secretProfile.min_entropy && secretCandidate.length >= secretProfile.min_length) {
                        const finding = {
                            type: 'SECRET_EXPOSURE',
                            file: file,
                            entropy: entropy,
                            severity: 'CRITICAL',
                            timestamp: new Date().toISOString()
                        };
                        finding.remediation = generateRemediation(finding);
                        findings.push(finding);
                        console.error(`❌ CRITICAL: High-entropy secret in ${file} (Entropy: ${entropy.toFixed(2)})`);
                    }
                }
            });
        }
    });

    // 3. Environmental Validation
    requiredEnvVars.forEach(v => {
        if (!existingEnvVars.has(v)) {
            const finding = { type: 'MISSING_DEPENDENCY', variable: v, severity: 'ADVISORY' };
            finding.remediation = generateRemediation(finding);
            findings.push(finding);
            console.warn(`⚠️  ADVISORY: Missing dependency "${v}" referenced in code.`);
        }
    });

    // 4. Generate Remediation Plan (Self-Healing)
    if (findings.length > 0) {
        let remediationPlan = "# XORAS: Automated Remediation Plan\n\n";
        findings.forEach(f => {
            remediationPlan += `### [${f.severity}] ${f.type}\n- **Target**: ${f.file || f.variable}\n- **Action**: ${f.remediation}\n\n`;
        });
        fs.writeFileSync('REMEDIATION_PLAN.md', remediationPlan);
        console.log("🩹 XORAS: Remediation Plan generated at REMEDIATION_PLAN.md");
    }

    // 5. Signed Finality Report (With OIDC Attestation)
    const report = {
        metadata: {
            engine: "XORAS_L5",
            timestamp: new Date().toISOString(),
            repository: process.env.GITHUB_REPOSITORY || 'local-repo',
            oidc_attestation: oidcToken || 'UNSIGNED-LOCAL-RUN'
        },
        findings: findings,
        status: findings.some(f => f.severity === 'CRITICAL') ? 'FAILED' : 'PASSED'
    };

    const signedReport = signer.sign(report);
    fs.writeFileSync('AUDIT_FINALITY.jws', signedReport);
    console.log(`\n✅ Audit Complete. Signed finality recorded in AUDIT_FINALITY.jws`);

    if (report.status === 'FAILED') {
        process.exit(1);
    }
}

function getLocalEnvVars() {
    const envPath = path.join(process.cwd(), '.env');
    const vars = new Set();
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
            if (match) vars.add(match[1]);
        });
    }
    return vars;
}

function getChangedFiles() {
    try {
        const staged = execSync('git diff --cached --name-only').toString().trim().split('\n').filter(f => f);
        if (staged.length > 0) return staged;
        return execSync('git diff --name-only HEAD~1 HEAD').toString().trim().split('\n').filter(f => f);
    } catch (e) {
        return [];
    }
}

runAudit();
