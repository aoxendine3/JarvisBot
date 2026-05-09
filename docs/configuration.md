# Configuration Guide

Deployment Safety is configured primarily through your project's environment files and an optional ignore manifest.

## 1. Environment Files
The tool uses two primary sources of truth:
- **`.env`**: Your active environment variables.
- **`.env.example`**: The baseline template for your project.

The audit verifiers compare variables discovered in your code against these two files to determine drift.

## 2. Ignore Rules (`.env-integrity-ignore`)
To exclude non-critical variables or large directories, create a `.env-integrity-ignore` file in your root directory.

### Example Manifest:
```text
# Ignore standard system vars
LANG
LC_ALL
PORT

# Ignore build artifacts
dist/
node_modules/
.next/
```

## 3. CLI Flags
- `--lang [code]`: Set reporting language (en, ja, zh, ko, es, fr, de, vi, th).
- `--report`: Output results in structured JSON.
- `--no-verify`: Skip integrity locking (Local development only).
- `--swarm`: Enable autonomous monitoring mode.

---
**Status**: v1.0.0-beta | Configurable | Lightweight.
