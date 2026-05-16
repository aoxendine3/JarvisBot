# 🏛️ env-integrity-sentry // Level-4 Pre-Commit CI Sentry
*Next.js 15 Asynchronous Route Validation, Environmental Secret Gating & AST Drift Enforcement.*

[![v3.0.0-production](https://img.shields.io/badge/version-3.0.0--production-00ffcc?style=flat-square)](https://github.com/aoxendine3/env-integrity-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd700.svg?style=flat-square)](LICENSE)
[![Verification Lock](https://img.shields.io/badge/Verification-SHA--256-blue?style=flat-square)](integrity.lock)

Stop production outages and SSR build failures before they happen. This lightweight, hardened CLI audits your repository AST for Next.js 15 asynchronous routing parameter drift, unmapped `.env` orphans, and hardcoded secrets—gating your CI/CD pipeline before flawed code ever hits release branches.

```bash
# Execute an instant local pre-commit scan across your repository
npx env-integrity-sentry .
```

---

## ⚡ Core Governance Capabilities

### 1. Next.js 15 Breaking Change Detection
Autonomously parses JavaScript/TypeScript AST signatures for dynamic route handlers, trapping any synchronous parameter destructuring (`const { slug } = params`) where the `await` keyword is missing.

### 2. Environmental Secret Gating
Scans filesystem streams for high-entropy tokens (AWS AKIA keys, OpenAI sk-tokens, Google AIza strings, and private PEM keys) and instantly aborts the commit if hardcoded secrets are detected.

### 3. Cryptographic Self-Verification (`integrity.lock`)
Every core module (`scanner.cjs`, `verifier.cjs`, `bin.cjs`) is verified against its SHA-256 cryptographic hash before execution. If configuration tampering or runtime module drift is detected, the sentry locks down instantly.

```bash
# Generate or verify the cryptographic lock
node bin/env-integrity-sentry.cjs --lock
```

---

## 💼 Commercial Enterprise Pilot ($2,000 Level-4 Sentry)
We deploy custom, high-throughput pre-commit sentries tailored to your enterprise infrastructure. 

**⚡ Open-Source Maintainer & Early Adopter Incentive:**
If your team actively maintains open-source infrastructure or is onboarding to our Level-4 sentry suite, we waive our $500 setup fee and offer a **50% discount on your first quarter pilot** ($1,000 total).

📧 **Direct Contact**: [Connect with Anthony via LinkedIn / Email](mailto:arvant.apex@gmail.com) | [XORAS Institutional Portal](https://aoxendine3.github.io/)

---

## 📚 Comprehensive Documentation
- [System Architecture](docs/architecture.md)
- [CI/CD Integration](docs/ci-integration.md)
- [Configuration Guide](docs/configuration.md)

### 📡 Secure Audit API

All POST requests to `/api/upload` now require a `session_id` field. This token is generated once per host environment and stored in `.xoras_session` (mode 600). Include it in your JSON payload:

```json
{
  "repository": "example/repo",
  "detail": "audit data",
  "session_id": "<YOUR_SESSION_TOKEN>"
}
```

The server validates the token before persisting the audit record. Missing or mismatched tokens result in HTTP 403.

To retrieve the token locally:
```bash
cat .xoras_session
```

Add the token to your CI secrets (e.g., `XORAS_SESSION_TOKEN`) and reference it in your audit scripts.

- [Testing & Verification](docs/testing.md)

---
*Secured by XORAS C-Vector Core. All telemetry verified.*
