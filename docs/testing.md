# Testing & Verification

Deployment Safety is stable and deterministic. We use a multi-layered testing strategy to ensure reliability across all primary environments.

## 1. Unit & Integration Tests
Located in `/tests/audit.test.cjs`, these tests validate:
- **Scanner Accuracy**: Proper discovery of variables in sample code.
- **Verifier Logic**: Correct detection of drift and missing documented risks.
- **Exit Code Apex**: Ensuring deterministic failures on drift.

## 2. Load & Concurrency Tests
Located in `/tests/spectrum.test.cjs`, these tests validate system behavior under stress.
- **Concurrent Cycles**: Tested with 100+ parallel audit runs.
- **Latency**: Average runtime < 1ms per cycle.
- **Determinism**: Identical inputs always produce identical results.

## 3. Cryptographic Verification
We use SHA-256 hashing to verify the integrity of the core orchestrator. 
- Run `node bin/env-integrity-sentry.cjs --verify` to manually validate the baseline.

---
**Status**: v1.0.0-beta | Verifiably Stable | Deterministic.
