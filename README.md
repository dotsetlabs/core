# @dotsetlabs/core

**Shared utilities for the dotset labs unified CLI.**

This internal package provides common functionality used by the `@dotsetlabs/cli` unified CLI.

## Purpose

This package is **not intended for direct use**. It provides:

- Unified project configuration (`.dotset/project.yaml`)
- Shared authentication (`~/.dotset/credentials.yaml`)
- Shared terminal output formatting (printBanner)
- Common UI helpers and colors
- Base API client for cloud operations

## Package Structure

```
src/
├── project.ts     # .dotset/ project management
├── auth.ts        # Unified credentials storage
├── ui.ts          # Terminal colors and helpers
├── api.ts         # Base HTTP client
├── integrations.ts # CLI detection utilities
└── index.ts       # Public exports
```

## Usage

This package is used internally by `@dotsetlabs/cli`:

```typescript
import {
    initializeProject,
    loadProjectConfig,
    isProjectInitialized,
    getAccessToken,
    isAuthenticated,
    colors,
} from '@dotsetlabs/core';
```

## For Users

If you want to use the dotset labs tools, install one of these packages instead:

- **[@dotsetlabs/cli](https://www.npmjs.com/package/@dotsetlabs/cli)** — Unified CLI with all products
- **[@dotsetlabs/axion](https://www.npmjs.com/package/@dotsetlabs/axion)** — Secrets management
- **[@dotsetlabs/gluon](https://www.npmjs.com/package/@dotsetlabs/gluon)** — Runtime telemetry

## License

MIT
