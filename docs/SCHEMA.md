# JSON Schema Specification (v1.0.0)

Machine-readable keys are **always English** regardless of the selected CLI locale.

## Output Structure

```json
{
  "timestamp": "ISO-8601 string",
  "summary": {
    "unexpected_missing": number,
    "secrets": number,
    "orphans": number
  },
  "findings": {
    "missingFromEnv": [
      { "key": "string", "type": "Runtime|Secret|Optional|General", "class": "expected but unset" }
    ],
    "missingFromAll": [
      { "key": "string", "type": "Runtime|Secret|Optional|General", "class": "undocumented risk" }
    ],
    "hardcodedSecrets": [
      { "file": "relative/path" }
    ],
    "orphans": ["VARIABLE_NAME"]
  }
}
```
