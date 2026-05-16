# env-integrity-sentry // Code Attestation & RevOps Suite
**Next.js 15 Asynchronous Route Verification, Environmental Secret Gating, O(1) Memory Indexing, and DevRel Orchestration.**

[![v3.0.0-production](https://img.shields.io/badge/version-3.0.0--production-00ffcc?style=flat-square)](https://github.com/aoxendine3/env-integrity-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd700.svg?style=flat-square)](LICENSE)
[![Verification Lock](https://img.shields.io/badge/Verification-SHA--256-blue?style=flat-square)](integrity.lock)

---

## 1. Executive Overview
`env-integrity-sentry` is an agentic governance engine combining deterministic AST code verification with a relational RevOps pipeline. 

Operating as an immediate local pre-commit guard, a persistent Model Context Protocol (MCP) server bridge, or a background DevRel closer, the runtime protects codebases from parameter drift, unmapped `.env` orphans, and secret leakage before code reaches release branches.

```bash
# Execute an instant local pre-commit scan across your repository
npx env-integrity-sentry .

# Or initiate the full 6-stage autonomous RevOps & DevRel loop
npm run revops
```

---

## 2. Technical Governance Capabilities

### 2.1 Next.js 15 Breaking Change AST Attestation
Parses JavaScript/TypeScript abstract syntax trees for dynamic route handlers, trapping synchronous parameter destructuring (`const { slug } = params`) where the required `await` keyword is missing.

### 2.2 Environmental Secret & Entropy Gating
Scans filesystem streams for high-entropy tokens (AWS AKIA keys, OpenAI sk-tokens, Google AIza strings, and private PEM keys). It aborts commit execution if hardcoded secrets are detected.

### 2.3 O(1) Relational Memory Ledger (`MemoryLedger`)
Powered by dual V8 Maps, the runtime indexes candidate repository leads in sub-millisecond execution times. This eliminates SQLite database locking conflicts and linear heap growth during concurrent background sweeps.

### 2.4 Cryptographic Self-Verification (`integrity.lock`)
Core modules (`scanner.cjs`, `verifier.cjs`, `bin.cjs`) are verified against their SHA-256 cryptographic hash before execution. If configuration tampering or runtime module drift is detected, the sentry aborts execution with exit code 1.

```bash
# Generate or verify the cryptographic lock
node bin/env-integrity-sentry.cjs --lock
```

---

## 3. Enterprise Pilot ($2,000 Level-4 Sentry)
We deploy custom pre-commit sentries tailored to enterprise infrastructure, complete with dedicated MCP persistence integration.

**Open-Source Maintainer Incentive:**
If your team actively maintains open-source infrastructure or is onboarding to our Level-4 sentry suite, we waive our $500 setup fee and offer a 50% discount on your first quarter pilot ($1,000 total contract value).

**Direct Contact & Scheduling:** Connect with Anthony via email: arvant.apex@gmail.com | [XORAS Institutional Portal](https://aoxendine3.github.io/)

---

## 4. Documentation Hierarchy
- [System Architecture](docs/architecture.md)
- [Universal Configuration & Manifest](docs/configuration.md)
- [CI/CD Integration](docs/ci-integration.md)
- [Testing & Verification Manifest](docs/testing.md)

### 4.1 Secure Audit API & MCP Session Gating
To prevent unauthorized telemetry ingestion, all POST requests to `/api/upload` and MCP server syncs require a verified `session_id` token. This token is generated once per host environment and stored locally in `.xoras_session` (`chmod 600`). Include it in your JSON payload:

```json
{
  "repository": "example/repo",
  "detail": "Level-4 AST Attestation Complete",
  "session_id": "<YOUR_SESSION_TOKEN>"
}
```

The server validates the token before persisting the audit record. Missing or mismatched tokens result in immediate HTTP 403 rejection.

To retrieve the token locally:
```bash
cat .xoras_session
```

Add the token to your CI secrets (e.g., `XORAS_SESSION_TOKEN`) and reference it in your automated pre-commit and audit runners.
