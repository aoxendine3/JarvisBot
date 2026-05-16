# Configuration & Operational Manifest
**Configuring the XORAS Sentry, MCP Persistence Bridge, and RevOps Loop.**

---

## 1. Multi-Tiered Configuration Hierarchy
The XORAS runtime adapts to local developer environments, CI/CD runners, and MCP server clusters. Configuration is resolved through a deterministic hierarchy:
1.  **Command Line Execution Flags:** Runtime overrides for immediate diagnostic sweeps.
2.  **Environment Variables (`.env` & `.xoras_session`):** Secure runtime tokens and cryptographic keys.
3.  **Institutional Manifest (`xoras.config.json`):** Unified repository governance and ignore rules.

---

## 2. Institutional Manifest (`xoras.config.json`)
For enterprise deployments, create a standardized `xoras.config.json` at the root of your workspace to govern AST inspection boundaries, memory caching, and DevRel outreach parameters.

```json
{
  "$schema": "https://raw.githubusercontent.com/aoxendine3/xoras-core/main/schemas/config.schema.json",
  "governance": {
    "level": 4,
    "enforceAsyncRoutes": true,
    "maxRecursionDepth": 20,
    "trapHighEntropySecrets": true
  },
  "memoryGrid": {
    "indexingEngine": "V8_MAP_O1",
    "mcpServerUri": "http://localhost:3002/sse",
    "garbageCollectionIntervalMs": 60000
  },
  "outboundVector": {
    "authorizedContact": "arvant.apex@gmail.com",
    "commercialPilotValuation": 2000,
    "openSourceDiscountPercentage": 50
  },
  "exclusionManifest": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/scratch/**"
  ]
}
```

---

## 3. Secure Session Token Gating (`.xoras_session`)
To prevent unauthorized telemetry ingestion and secure distributed MCP communications, all audit events require a persistent session token:
*   **Token Generation:** Created automatically on initial setup and stored in `.xoras_session` with strict file permissions (`chmod 600`).
*   **CI/CD Injection:** Pass the token into your GitHub Actions runner as a secure repository secret (`XORAS_SESSION_TOKEN`).

```bash
# Verify local session token security
ls -la .xoras_session
```

---

## 4. Execution Flags
The CLI and daemon runtimes support the following operational modes:
*   `--revops`: Initiate the 6-stage autonomous PR Sniper, Prioritizer, and DevRel closer loop.
*   `--mcp-bridge [uri]`: Connect directly to a persistent SQLite Model Context Protocol SSE server.
*   `--benchmark`: Execute V8 Map vs Object JIT performance comparisons across 100,000 dynamic keys.
*   `--sentry-lock`: Generate or verify the SHA-256 cryptographic self-attestation hash (`integrity.lock`).
*   `--no-verify`: Temporarily bypass local pre-commit hooks for isolated testing environments.
