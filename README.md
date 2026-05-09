# Deployment Safety & Drift Enforcement

**Prevent broken deploys caused by missing environment variables.**

[![v1.0.0-beta](https://img.shields.io/badge/version-1.0.0--beta-green)](https://github.com/aoxendine3/env-integrity-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Stop production outages before they happen. This lightweight CLI audits your environment for drift, undocumented risks, and hardcoded secrets—ensuring your CI/CD pipelines only deploy what is safe.

## 1. Quickstart (One Command)
Run the audit instantly in any repository without installation:
```bash
npx env-integrity-sentry .
```

## 2. Core Value
- **Catch Drift**: Identifies variables used in code but missing from your `.env` or `.env.example`.
- **Apex Locking**: SHA-256 verification of core deployment modules.
- **Fail Fast**: Stable documented exit codes (0/1/2) for build gating.
- **Global Ready**: 9-locale reporting for international teams.

## 3. Pricing & Sub Plans
Available in tiers designed to fit teams of all sizes:
- **Free**: Local CLI ($0 / Forever)
- **Pro**: $49/mo (Team Workflows)
- **Enterprise**: $499/mo (Governance & SSO)
*See [PRICING.md](docs/PRICING.md) for details.*

## 4. Documentation
- [Project Overview](docs/overview.md)
- [System Architecture](docs/architecture.md)
- [CI/CD Integration](docs/ci-integration.md)
- [Configuration Guide](docs/configuration.md)
- [Usage Examples](docs/examples.md)
- [FAQ](docs/faq.md)
- [Testing & Verification](docs/testing.md)

---
**Status**: v1.0.0-beta | Ready for Beta Evaluation.
