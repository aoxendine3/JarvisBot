# Usage Examples

Here are the most common usage patterns for Deployment Safety.

## 1. Local Audit
Run a quick audit of your current directory:
```bash
npx env-integrity-sentry .
```

## 2. CI/CD Gating
Use in a CI environment to block a build on drift:
```bash
# This will exit with code 1 if drift is found
npx env-integrity-sentry .
```

## 3. JSON Reporting
Generate a machine-readable report for external tools:
```bash
npx env-integrity-sentry . --report > audit-report.json
```

## 4. Multi-Locale Support
Run the audit with localized output (e.g., Japanese):
```bash
npx env-integrity-sentry . --lang ja
```

## 5. Bypassing Apex (Development Only)
Skip SHA-256 verification for local-only iterations:
```bash
npx env-integrity-sentry . --no-verify
```

---
**Status**: v1.0.0-beta | Multi-region ready.
