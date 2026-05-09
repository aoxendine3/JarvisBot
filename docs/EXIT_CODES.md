# Exit Codes & Automation Signals

v1.0.0 | Deployment Safety & Drift Enforcement

| Code | Status  | Meaning                                      |
| ---- | ------- | -------------------------------------------- |
| **0**| Success | No drift detected. Apex verified.       |
| **1**| Drift   | Variables missing or orphaned.               |
| **2**| Error   | Cryptographic integrity failure (SHA-256).   |
| **3**| Schema  | Invalid configuration or missing .env.example|
