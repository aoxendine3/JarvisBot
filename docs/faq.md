# FAQ: Deployment Safety

## 1. What is "Environment Drift"?
Drift occurs when your source code depends on environment variables that are missing from your configuration files (`.env` or `.env.example`). This often leads to runtime errors in production.

## 2. Why did my build fail with Exit Code 2?
Exit Code 2 indicates an **Apex Failure**. This means the SHA-256 hash of a core deployment module (like `bin.cjs`) does not match the baseline in `integrity.lock`. This is a security feature to prevent unauthorized modification of the audit engine.

## 3. How do I ignore non-critical variables?
Create a `.env-integrity-ignore` file and add the variable names. See the [Configuration Guide](configuration.md) for details.

## 4. Can I use this with languages other than Node.js?
Yes. The scanner identifies `process.env` patterns by default, but the underlying verification logic can be adapted for any environment variable system.

## 5. Is it safe to use in Production?
Yes. The tool is lightweight and designed to run as a CI gate. It does not modify your environment variables; it only audits them for safety.

---
**Status**: v1.0.0-beta | Engineering Support active.
