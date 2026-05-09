# CI/CD Integration Examples

v1.0.0 | Deployment Safety & Drift Enforcement

## GitHub Actions (Deploy Gate)

```yaml
name: Deployment Safety Gate
on: [push]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install
        run: npm install
      - name: Verify Apex
        run: node bin.cjs --verify
      - name: Audit Drift
        run: node bin.cjs . # Exits 1 on drift
```

## GitLab CI (Policy Check)

```yaml
stages:
  - test
  - deploy

drift_check:
  stage: test
  script:
    - node bin.cjs .
  allow_failure: false
```
