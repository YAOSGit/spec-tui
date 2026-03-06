# Custom Example -- Remote Spec Fetching

This example demonstrates loading an OpenAPI spec directly from a remote URL, bypassing the need for a local file.

## What This Shows

- **Remote URL support**: spec-tui can fetch and parse specs from any HTTP(S) endpoint
- **Zero local files**: no need to download or maintain a local copy of the spec
- **Real-world spec**: uses the official Swagger Petstore v3 API hosted at `petstore3.swagger.io`

## How to Run

```bash
./examples/custom/fetch-remote.sh
```

Or run the command directly:

```bash
npx spec-tui https://petstore3.swagger.io/api/v3/openapi.json
```

The TUI launches with the full Petstore v3 spec loaded from the remote server. From there, browse endpoints, inspect schemas, and send test requests the same way as with a local file.

## Files included

- `fetch-remote.sh` -- Shell wrapper that launches spec-tui with the remote Petstore v3 URL.
