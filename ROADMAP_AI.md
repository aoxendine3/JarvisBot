# AI Integration Roadmap: ROI Elevation (v1.1.0)

This roadmap leverages specific Hugging Face models to transform `env-integrity-sentry` from a regex auditor into a semantic security platform.

## 1. Advanced Secret Detection
- **Model**: `ProtectAI/secret-detection-model` (or similar CodeBERT variants)
- **Utility**: Leverages Transformers to identify keys and tokens based on character entropy and surrounding code context, drastically reducing regex-based false positives.

## 2. Semantic Dependency Mapping
- **Model**: `ibm-granite/granite-embedding-97m-multilingual-r2`
- **Utility**: Vectorizes `process.env` usage to identify "Missing but Probable" variables based on common framework patterns (e.g., if `STRIPE_KEY` exists, the model predicts `STRIPE_WEBHOOK_SECRET` should also exist).

## 3. Vulnerability Contextualization
- **Model**: `meta-llama/Llama-3.1-8B-Instruct`
- **Utility**: Provides developer-focused explanations of *why* a missing variable is critical and generates the correct `.env.example` entry automatically.

## 4. Operational Status
- **Current State**: Ingestion Complete.
- **Next Step**: Evaluate model latency vs. the < 50ms CLI performance mandate.
