# Real-World Use Cases: Mistake Prevention

`env-integrity-sentry` is engineered to catch common development and deployment mistakes before they impact production.

## 1. Preventing "Silent" Runtime Crashes
**Scenario**: A developer adds `process.env.STRIPE_SECRET` to a new payment module but forgets to add it to `.env.example`.
**Result**: The build passes, but production fails during checkout.
**Sentry Solution**: Fails the build with `❌ Unexpected Dependency`, forcing the developer to define the variable.

## 2. Instant Onboarding (Setup Discovery)
**Scenario**: A new engineer clones a project with 50+ environment variables.
**Result**: Hours spent trial-and-erroring the setup.
**Sentry Solution**: Provides a `⚠️ Missing but Expected` report, listing every required variable in < 500ms.

## 3. Detecting "Ghost" Logic (Orphans)
**Scenario**: A feature is deleted, but its environment variables remain in `.env`, creating technical debt and potential security sprawl.
**Sentry Solution**: Flags `⚠️ Orphaned Variables`, identifying configuration that is no longer used in code.

## 4. CI/CD Governance
**Scenario**: A pull request is merged with missing configuration.
**Result**: The staging environment breaks.
**Sentry Solution**: Automatically blocks the PR if the codebase introduces new dependencies not reflected in the environment tranches.
