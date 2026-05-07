# Limits Test: env-integrity-sentry

**Date**: 2026-05-07

## 1. File Size
- **Test**: 50MB JavaScript file.
- **Result**: Skipped.
- **Metric**: Execution time < 40ms.

## 2. Directory Depth
- **Test**: 30-level directory tree.
- **Result**: Traversal stopped at level 20.

## 3. Recursion
- **Test**: Circular symbolic link.
- **Result**: Ignored.

## 4. Logic Accuracy
- **Test**: Missing code dependencies vs setup variables.
- **Result**: Correctly differentiated.
- **Exit Code**: 1 on missing dependency; 0 on setup warning.
