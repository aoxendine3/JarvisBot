# 🏛️ env-integrity-sentry // Sovereign Code Attestation & RevOps Suite
**Next.js 15 Asynchronous Route Verification, Environmental Secret Gating, $O(1)$ Memory Indexing, and Autonomous DevRel Orchestration.**

[![v3.0.0-production](https://img.shields.io/badge/version-3.0.0--production-00ffcc?style=flat-square)](https://github.com/aoxendine3/env-integrity-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd700.svg?style=flat-square)](LICENSE)
[![Verification Lock](https://img.shields.io/badge/Verification-SHA--256-blue?style=flat-square)](integrity.lock)

---

## ⚡ Executive Overview
**env-integrity-sentry** is a high-throughput, versatile agentic governance engine. Rejecting the limitations of traditional, narrow CLI tooling, it combines deterministic AST code verification with an autonomous relational RevOps pipeline. 

Whether operating as an immediate local pre-commit guard, a persistent Model Context Protocol (MCP) server bridge, or an autonomous social prospecting closer, the runtime protects enterprise codebases from parameter drift, unmapped `.env` orphans, and hardcoded secret leakage before flawed code ever hits release branches.

```bash
# Execute an instant local pre-commit scan across your repository
npx env-integrity-sentry .

# Or initiate the full 6-stage autonomous RevOps & DevRel loop
npm run revops
```

---

## 🛡️ Sovereign Governance Capabilities

### 1. Next.js 15 Breaking Change AST Attestation
Autonomously parses JavaScript/TypeScript abstract syntax trees for dynamic route handlers, trapping any synchronous parameter destructuring (`const { slug } = params`) where the required `await` keyword is missing.

### 2. Environmental Secret & Entropy Gating
Scans filesystem streams for high-entropy tokens (AWS AKIA keys, OpenAI sk-tokens, Google AIza strings, and private PEM keys). It instantly aborts commit execution if hardcoded secrets are detected, enforcing absolute zero-leakage finality.

### 3. $O(1)$ Relational Memory Ledger (`MemoryLedger`)
Powered by dual high-speed V8 Maps, the runtime indexes thousands of candidate repository leads in sub-millisecond execution times. This eliminates SQLite database locking conflicts and linear heap growth during concurrent background sweeps.

### 4. Cryptographic Self-Verification (`integrity.lock`)
Every core module (`scanner.cjs`, `verifier.cjs`, `bin.cjs`) is verified against its SHA-256 cryptographic hash before execution. If configuration tampering or runtime module drift is detected, the sentry locks down instantly.

```bash
# Generate or verify the cryptographic lock
node bin/env-integrity-sentry.cjs --lock
```

---

## 💼 Commercial Enterprise Pilot ($2,000 Level-4 Sentry)
We deploy custom, high-throughput pre-commit sentries tailored to your enterprise infrastructure, complete with dedicated MCP persistence integration.

**⚡ Open-Source Maintainer & Early Adopter Incentive:**
If your team actively maintains open-source infrastructure or is onboarding to our Level-4 sentry suite, we waive our $500 setup fee and offer an exclusive **50% discount on your first quarter pilot** ($1,000 total contract value).

📧 **Direct Contact & Scheduling**: [Connect with Anthony via LinkedIn / Email](mailto:arvant.apex@gmail.com) | [XORAS Institutional Portal](https://aoxendine3.github.io/)

---

## 📚 Comprehensive Documentation Hierarchy
- [System Architecture](docs/architecture.md)
- [Universal Configuration & Manifest](docs/configuration.md)
- [CI/CD Integration](docs/ci-integration.md)
- [Testing & Verification Manifest](docs/testing.md)

### 📡 Secure Audit API & MCP Session Gating
To guarantee absolute security and prevent unauthorized telemetry ingestion, all POST requests to `/api/upload` and MCP server syncs require a verified `session_id` token. This token is generated once per host environment and stored locally in `.xoras_session` (`chmod 600`). Include it in your JSON payload:

```json
{
  "repository": "example/repo",
  "detail": "Level-4 AST Attestation Complete",
  "session_id": "<YOUR_SESSION_TOKEN>"
}
```

The server validates the token before persisting the audit record. Missing or mismatched tokens result in immediate HTTP 403 rejection.

To retrieve the token locally:
```bash
cat .xoras_session
```

Add the token to your CI secrets (e.g., `XORAS_SESSION_TOKEN`) and reference it in your automated pre-commit and audit runners.

---
*Secured by XORAS C-Vector Core. All telemetry verified.*
