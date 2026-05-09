# GitHub Action Integration

The **Deployment Safety Sentry** can be integrated into any GitHub Action workflow to prevent broken deployments caused by missing environment variables.

## 1. Quickstart (Hard Gate)

Add the following step to your `.github/workflows/deploy.yml` before your deployment step:

```yaml
- name: Audit Environment Apex
  uses: SOVEREIGN-INTEGRITY/env-integrity-sentry@v1.0.0-beta
  with:
    path: '.'
    # upload-url: 'https://telemetry.yourdomain.com'
```

## 2. Advanced Configuration

| Input | Description | Default |
| :--- | :--- | :--- |
| `path` | Repository path to audit. | `.` |
| `upload-url` | Remote telemetry endpoint. | `None` |
| `no-verify` | Skip SHA-256 integrity check. | `false` |

## 3. Enforcement Logic
The action returns:
- **Success (0)**: Environment and integrity are clean.
- **Failure (1)**: Environment drift detected (Missing variables).
- **Failure (2)**: Apex failure (Compromised core modules).

---
**Status**: v1.0.0-beta | CI-Ready | Scoped.
