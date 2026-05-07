# env-integrity-sentry

Detect missing environment variables before deployment.

## Use Cases
- **CI Enforcement**: Fail builds when code depends on undefined variables.
- **Onboarding**: List all required variables for a repository setup.
- **Cleanup**: Identify environment variables no longer used in code.

## Installation
```bash
npm install -D env-integrity-sentry
```

## CLI Usage
```bash
npx env-integrity-sentry [path]
```

## Example Output
```text
Missing from .env (Defined in .env.example):
- DATABASE_URL

Missing from all env files (Used in code):
- STRIPE_SECRET

Audit failed.
```
