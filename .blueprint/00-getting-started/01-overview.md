---
title: Overview
teleport:
  file: src/app/cli.tsx
  line: 8
---

# spec-tui Overview

## What it does

spec-tui is a keyboard-driven TUI for exploring and testing OpenAPI specs directly from the terminal. It accepts a spec path or URL, parses it with swagger-parser, and renders an interactive three-pane interface using Ink.

## How it boots

The entry point is `runCLI` at line 8. It uses `createCLI` from toolkit to set up a Commander program, takes a `<spec>` argument and an optional `--base-url` override, then renders the root `<App>` component.

## What to do

Press `o` to teleport to the CLI entry point and see how the app boots.
