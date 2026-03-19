---
title: Request Builder
teleport:
  file: src/utils/request/index.ts
  line: 5
---

# Request Builder

## Key functions

The request module has two key functions. `buildUrl` (line 5) takes a base URL, path template, path params, and query params and produces a fully resolved URL -- it substitutes `{param}` placeholders and appends query parameters via the URL API.

## How execution works

`executeRequest` (line 37) fires the actual HTTP request using axios with `arraybuffer` response type for binary safety. It measures duration with `performance.now()`, detects binary content types, and parses JSON responses automatically. Errors are caught and returned as a `ResponseData` with status 0 rather than thrown.

## What to do

Press `o` to teleport to the `buildUrl` function.
