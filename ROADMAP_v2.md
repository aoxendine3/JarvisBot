# XORAS: ENGINEERING INTEGRITY MANAGEMENT (v2.0)
Status: ACTIVE | Goal: Pilot Distribution & Release Confidence

## CORE ARCHITECTURE
- **Platform**: XORAS
- **Core Engine**: `env-integrity-sentry`
- **Governance Layer**: RIGI (Release Integrity Governance Infrastructure)
- **Primary Distribution**: `xoras-action` (GitHub Action)

---

## IMMEDIATE ROADMAP (Next 2 Weeks)

### Priority 1: GitHub Action Distribution (`xoras/action@v1`)
- [ ] Scaffold standard `action.yml` wrapping the `env-integrity-sentry` core.
- [ ] Ensure seamless integration with `XORAS_MODE=ADVISORY` as default.
- [ ] Test the action on the vulnerable demo app.

### Priority 2: Public Documentation
- [ ] Write calm, precise, professional documentation.
- [ ] Focus on "Release Confidence" and "Engineering Integrity Management".
- [ ] Document the 30-Day Release Integrity Pilot (Advisory Mode, Dashboards, PR summaries).

### Priority 3: Demo Walkthrough Video & Lab
- [ ] Publish the synthetic regression lab (`xoras-demo-vulnerable-app`).
- [ ] Record a walkthrough showing prevented incidents and drift timelines.

### Priority 4: Landing Page
- [ ] Build a simple, clean landing page targeting 5-30 engineer teams.
- [ ] Core messaging: "Release Confidence" (Not "security/compliance").
- [ ] Highlight the free Pilot Advisory tier.

### Priority 5: Pilot Onboarding Flow
- [ ] Define the exact steps for a team to install `xoras/action@v1`.
- [ ] Create templates for weekly governance reports.

---
*Operational Standard: Calm, Reliable, Measurable.*
