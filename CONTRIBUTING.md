# Contributing to Deployment Safety

We welcome contributions that improve the stability and safety of this tool. 

## Development Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/aoxendine3/env-integrity-sentry.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run tests**:
   ```bash
   node tests/audit.test.cjs
   ```

## Pull Request Guidelines

- **Simplicity over Complexity**: We favor minimalist solutions that are easy to audit.
- **Tests Required**: Every bug fix or feature must include a corresponding test.
- **Documentation**: Update `README.md` or `/docs` if your change affects the user interface.
- **Commit Messages**: Use clear, technical descriptions (e.g., `fix: correctly handle symlinks in scanner`).

## Code of Conduct
We follow the standard SOVEREIGN contributor covenant. Be professional.
