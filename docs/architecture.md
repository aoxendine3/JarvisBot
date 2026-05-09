# System Architecture: The Layered Contract

Deployment Safety is built as a **Layered Infrastructure Architecture**. This design decouples the deterministic core engine from its various delivery surfaces, ensuring stability, scalability, and integrity.

## 1. Core Engine (The Contract)
Located in `/lib/core/`, this is the project's "Source of Truth." It is boring, deterministic, and versioned.
- **Scanner**: Discovery of environment variable patterns.
- **Verifier**: Audit against baseline environment files.
- **Policy**: Risk classification and exit logic determination.
- **Apex**: SHA-256 cryptographic module verification.

## 2. Interface Layer (The Surfaces)
The core logic is wrapped in specialized interfaces to meet different operational needs:
- **CLI (`/bin`)**: The primary surface for local development and manual audits.
- **CI/CD (`.github/workflows`)**: Automated "Safety Gate" enforcement.
- **Swarm (`swarm.cjs`)**: Proactive, autonomous monitoring surface.

## 3. Governance Layer (Enterprise Value)
This layer defines how the tool is used within an organization:
- **Policies**: Structured ignore rules and risk thresholds.
- **JSON Schema**: Machine-readable reporting for institutional integration.
- **Apex Locking**: Cryptographic baseline enforcement for high-security pipelines.

## 4. Distribution Layer (Adoption)
The surfaces through which the tool is adopted and marketed:
- **Documentation (`/docs`)**: Technical guides and FAQs.
- **Commercial Model (`PRICING.md`)**: Value-based sub plans ($49 / $499 / $4,999).
- **Brand Portal (`brands.html`)**: The Sovereign Integrity institutional entry point.

---
**Core Rule**: Core logic must remain unchanged unless fixing bugs. We scale the surfaces, not the engine.
