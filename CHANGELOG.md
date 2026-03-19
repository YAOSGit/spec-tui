# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [126.1.0] - 2026-03-19

### Added

- `StatusBar` uses `width="100%"` for full-width rendering
- Hooks moved to `src/hooks/` directory with explicit return types
- `FieldEditor.consts.ts` for color constants
- E2E flag tests (--help, --version, --base-url)

### Changed

- Internal function declarations converted to const arrows (9 instances)
- `AppProviders` uses `React.FC` pattern
- Non-null assertions in tests replaced with `expect().toBeDefined()` guards
- Toolkit bumped to 0.0.26-3-19a
- Biome updated to 2.4.8

### Fixed

- `new URL('')` crash when OpenAPI spec has no servers — falls back to `http://localhost`

## [126.0.0] - 2026-03-03

### Added

- Three-pane TUI for exploring OpenAPI specifications in the terminal
- Endpoint navigator with fuzzy search filtering
- Request workshop with parameter editing, body composition, and auth configuration
- Live HTTP request execution with response viewer
- Schema-to-TypeScript type generation and mock export via Faker.js
- Keyboard-driven navigation across navigator, detail, and config panes
- Support for local files and remote URLs as spec sources
- Base URL override via `--base-url` flag
- Ecosystem integration hooks for env-lock, mesh-sync, and run-ctx
