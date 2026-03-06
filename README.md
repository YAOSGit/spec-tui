<h1 align="center">Yet another Open Source spec-tui</h1>

<p align="center">
  <strong>Keyboard-driven TUI for exploring, searching, and testing OpenAPI specifications directly from the terminal</strong>
</p>

<div align="center">

![Node Version](https://img.shields.io/badge/NODE-18+-16161D?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=%235FA04E)
![TypeScript Version](https://img.shields.io/badge/TYPESCRIPT-5.9-16161D?style=for-the-badge&logo=typescript&logoColor=white&labelColor=%233178C6)
![React Version](https://img.shields.io/badge/REACT-19.2-16161D?style=for-the-badge&logo=react&logoColor=black&labelColor=%2361DAFB)

![Uses Ink](https://img.shields.io/badge/INK-16161D?style=for-the-badge&logo=react&logoColor=white&labelColor=%2361DAFB)
![Uses Vitest](https://img.shields.io/badge/VITEST-16161D?style=for-the-badge&logo=vitest&logoColor=white&labelColor=%236E9F18)
![Uses Biome](https://img.shields.io/badge/BIOME-16161D?style=for-the-badge&logo=biome&logoColor=white&labelColor=%2360A5FA)

</div>

---

## Table of Contents

### Getting Started

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Usage](#cli-usage)

### Features

- [Three-Pane Layout](#three-pane-layout)
- [Fuzzy Search](#fuzzy-search)
- [Schema Validation](#schema-validation)
- [Mock Export](#mock-export)

### Integrations

- [Ecosystem Integrations](#ecosystem-integrations)

### Development

- [Available Scripts](#available-scripts)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Overview

**spec-tui** is a keyboard-driven TUI alternative to Swagger UI and Scalar. It parses any OpenAPI 3.x spec and renders an interactive three-pane interface for exploring endpoints, building requests with validated inputs, and inspecting responses — all without leaving the terminal.

### What Makes This Project Unique

- **Terminal-Native**: No browser needed — explore APIs from the same terminal where you code
- **Schema-Driven Validation**: Zod validators generated from JSON Schema catch input errors before sending
- **Ecosystem Bridges**: Integrates with env-lock (auth), mesh-sync (auto-refresh), and run-ctx (base URLs)
- **Mock Generation**: Export any API response as a typed TypeScript mock file for unit tests

---

## Installation

```bash
# Install globally from npm
npm install -g @yaos-git/spec-tui

# Or install as a dev dependency
npm install -D @yaos-git/spec-tui
```

### From Source

```bash
# Clone the repository
git clone https://github.com/YAOSGit/spec-tui.git
cd spec-tui

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

---

## Quick Start

```bash
# Point at a local spec file
spec-tui ./petstore.yaml

# Or a remote URL
spec-tui https://petstore3.swagger.io/api/v3/openapi.json
```

The TUI will parse the spec and render all endpoints in a navigable three-pane layout.

---

## CLI Usage

```text
spec-tui <spec>                    Open an OpenAPI spec (path or URL)
spec-tui <spec> -b <url>           Override the base URL from the spec
spec-tui --help, -h                Show help message
spec-tui --version, -v             Show version information
```

### Examples

```bash
# Open a local file
spec-tui petstore.yaml

# Open a remote spec
spec-tui https://api.example.com/openapi.json

# Override base URL for staging
spec-tui petstore.yaml -b https://staging.api.com

# Print version
spec-tui --version
```

---

## Three-Pane Layout

The TUI is organized into three panes:

### Endpoint Navigator (Left)

- Browse all API operations grouped by tags
- Color-coded HTTP methods: GET (green), POST (yellow), PUT (blue), PATCH (cyan), DELETE (red)
- Keyboard navigation with visual selection indicator
- Deprecated endpoints are visually dimmed

### Request Workshop (Center)

- Dynamic input forms auto-generated from OpenAPI parameters and request body schemas
- Real-time Zod validation against the spec before sending
- Integration with env-lock for auto-injecting auth headers

### Response & Schema Viewer (Right)

- Response body with status code and timing
- TypeScript-like schema view converted from JSON Schema
- Request history for replaying previous calls

---

## Fuzzy Search

Filter endpoints by any field using fuse.js-powered fuzzy matching:

- Path: `/pets`, `/users/{id}`
- Summary: `List all pets`, `Create user`
- Operation ID: `listPets`, `createUser`
- Tags: `pets`, `admin`

---

## Schema Validation

Request inputs are validated at runtime using Zod schemas auto-generated from the OpenAPI spec's JSON Schema definitions. This catches type mismatches, missing required fields, and invalid values before the request is sent.

---

## Mock Export

After receiving a response, export it as a typed TypeScript mock file:

```typescript
// Auto-generated mock from spec-tui
// Status: 200 OK
// Captured: 2026-03-04T00:00:00.000Z

export const listPetsMock = [
  { "id": 1, "name": "Rex" }
] as const;
```

---

## Ecosystem Integrations

| Integration | Env Variable | Description |
|-------------|-------------|-------------|
| **env-lock** | `ENV_LOCK_TOKEN` | Auto-injects Bearer token into request headers |
| **mesh-sync** | — | Detects when spec file is managed by mesh-sync for auto-refresh |
| **run-ctx** | `SPEC_TUI_BASE_URL` | Overrides base URL for context-aware environments |

---

## Available Scripts

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run TypeScript checking + test watcher concurrently |
| `npm run dev:typescript` | Run TypeScript type checking in watch mode |
| `npm run dev:test` | Run Vitest in watch mode |

### Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Bundle the CLI with esbuild |

### Lint Scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Run type checking, linting, formatting, and audit |
| `npm run lint:check` | Check code for linting issues with Biome |
| `npm run lint:fix` | Check and fix linting issues with Biome |
| `npm run lint:format` | Format all files with Biome |
| `npm run lint:types` | Run TypeScript type checking only |
| `npm run lint:audit` | Run npm audit |

### Testing Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (unit, react, types, e2e) |
| `npm run test:unit` | Run unit tests |
| `npm run test:react` | Run React component tests |
| `npm run test:types` | Run type-level tests |
| `npm run test:e2e` | Build and run end-to-end tests |

---

## Tech Stack

### Core

- **[React 19](https://react.dev/)** — UI component library
- **[Ink 6](https://github.com/vadimdemedes/ink)** — React for CLIs
- **[TypeScript 5](https://www.typescriptlang.org/)** — Type-safe JavaScript
- **[@apidevtools/swagger-parser](https://github.com/APIDevTools/swagger-parser)** — OpenAPI parsing and `$ref` resolution
- **[fuse.js](https://www.fusejs.io/)** — Lightweight fuzzy search
- **[Zod](https://zod.dev/)** — Runtime schema validation
- **[axios](https://axios-http.com/)** — HTTP client

### Build & Development

- **[esbuild](https://esbuild.github.io/)** — Fast bundler
- **[Vitest](https://vitest.dev/)** — Unit testing framework
- **[Biome](https://biomejs.dev/)** — Linter and formatter

### UI Components

- **[@inkjs/ui](https://github.com/vadimdemedes/ink-ui)** — Ink UI components
- **[Chalk](https://github.com/chalk/chalk)** — Terminal string styling

---

## Project Structure

```
spec-tui/
├── src/
│   ├── app/                    # Application entry points
│   │   ├── cli.tsx             # CLI entry point (Commander)
│   │   ├── app.tsx             # Main three-pane layout
│   │   ├── index.tsx           # React app root
│   │   └── providers.tsx       # Provider wrapper
│   ├── components/             # React (Ink) components
│   │   ├── EndpointNavigator/  # Left pane — endpoint list
│   │   ├── StatusBar/          # Top bar — spec info
│   │   ├── ResponseViewer/     # Right pane — response display
│   │   └── SchemaViewer/       # Right pane — schema display
│   ├── parser/                 # OpenAPI parsing
│   │   ├── openapi/            # Spec → Endpoint[] extraction
│   │   └── schemaToZod/        # JSON Schema → Zod validators
│   ├── providers/              # React context providers
│   │   ├── SpecProvider/       # Parsed spec state
│   │   ├── NavigationProvider/ # Pane/selection state
│   │   └── RequestProvider/    # Request/response state
│   ├── types/                  # TypeScript type definitions
│   │   ├── Endpoint/           # Endpoint, HttpMethod, Parameter
│   │   ├── RequestConfig/      # Request configuration
│   │   ├── ResponseData/       # Response and history types
│   │   └── AppConfig/          # CLI configuration
│   ├── utils/                  # Utility functions
│   │   ├── request/            # URL builder and HTTP executor
│   │   ├── search/             # Fuzzy endpoint search (fuse.js)
│   │   ├── schemaToType/       # JSON Schema → TypeScript string
│   │   └── mock/               # Mock file generator
│   └── integrations/           # Ecosystem bridges
│       ├── envLock/            # env-lock auth header injection
│       ├── meshSync/           # mesh-sync managed spec detection
│       └── runCtx/             # run-ctx base URL resolution
├── e2e/                        # End-to-end tests
├── examples/                   # Example OpenAPI specs
│   └── basic/petstore.yaml
├── biome.json                  # Biome configuration
├── tsconfig.json               # TypeScript configuration
├── vitest.unit.config.ts       # Unit test configuration
├── vitest.react.config.ts      # React test configuration
├── vitest.type.config.ts       # Type test configuration
├── vitest.e2e.config.ts        # E2E test configuration
├── esbuild.config.js           # esbuild bundler configuration
└── package.json
```

---

## Versioning

This project uses a custom versioning scheme: `MAJORYY.MINOR.PATCH`

| Part | Description | Example |
|------|-------------|---------|
| `MAJOR` | Major version number | `1` |
| `YY` | Year (last 2 digits) | `26` for 2026 |
| `MINOR` | Minor version | `0` |
| `PATCH` | Patch version | `0` |

**Example:** `126.0.0` = Major version 1, released in 2026, minor 0, patch 0

---

## Style Guide

Conventions for contributing to this project. All rules are enforced by code review; Biome handles formatting and lint.

### Exports

- **Named exports only** — no `export default`. Every module uses `export function`, `export const`, or `export type`.
- **`import type`** — always use `import type` for type-only imports.
- **`.js` extensions** — all relative imports use explicit `.js` extensions (ESM requirement).

### File Structure

```
src/
├── app/              # Entry points and root component
├── commands/         # Command definitions
├── components/       # React components (PascalCase directories)
│   └── MyComponent/
│       ├── index.tsx
│       ├── MyComponent.types.ts
│       └── MyComponent.test.tsx
├── providers/        # React context providers (PascalCase directories)
│   └── MyProvider/
│       ├── index.tsx
│       ├── MyProvider.types.ts
│       └── MyProvider.test.tsx
├── types/            # Shared type definitions (PascalCase directories)
│   └── MyType/
│       ├── index.ts
│       └── MyType.test-d.ts
└── utils/            # Pure utility functions (camelCase directories)
    └── myUtil/
        ├── index.ts
        └── myUtil.test.ts
```

### Components & Providers

- **Components** use `function` declarations: `export function MyComponent(props: MyComponentProps) {}`
- **Providers** use `React.FC` arrow syntax: `export const MyProvider: React.FC<Props> = ({ children }) => {}`
- **Props** are defined in a co-located `.types.ts` file using the `interface` keyword.
- Components receive data via props — never read `process.stdout` or global state directly.

### Types

- Use `type` for data shapes and unions. Use `interface` for component props.
- Shared types live in `src/types/TypeName/index.ts` with a co-located `TypeName.test-d.ts`.
- Local types live in co-located `.types.ts` files — never inline in implementation files.
- No duplicate type definitions — import from the canonical source.

### Constants

- Named constants go in `.consts.ts` files (e.g., `MyComponent.consts.ts`).
- No magic numbers in implementation files — extract to named constants.
- Cross-component constants belong in `src/utils/`, not in a specific component's `.consts.ts`.

### Testing

- Every module has a co-located test file.
- Components: `ComponentName.test.tsx`
- Utils: `utilName.test.ts`
- Types: `TypeName.test-d.ts` (type-level tests using `expectTypeOf`/`assertType`)

---

## License

ISC
