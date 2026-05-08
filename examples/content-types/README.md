# Integration Example -- Content Types and Rich Response Rendering

Full integration setup demonstrating spec-tui's ability to detect and render a wide range of content types, handle file uploads, and save response attachments.

## What This Shows

- **10+ content types**: JSON, XML, HTML, CSV, JavaScript, CSS, plain text, binary, and `image/png`
- **Multi-format endpoints**: a single endpoint that returns JSON, XML, or CSV based on a query parameter
- **File upload forms**: `multipart/form-data` with single and multiple file fields
- **Attachment downloads**: responses with `Content-Disposition: attachment` headers (text, JSON, and image)
- **Mock server**: a standalone Node.js HTTP server that implements every endpoint in the spec

## Endpoints

| Method | Path                 | Content Type(s)                                       | Tags   |
|--------|----------------------|-------------------------------------------------------|--------|
| GET    | `/data/json`         | `application/json`                                    | data   |
| GET    | `/data/xml`          | `application/xml`                                     | data   |
| GET    | `/data/html`         | `text/html`                                           | data   |
| GET    | `/data/csv`          | `text/csv`, `application/json`                        | data   |
| GET    | `/data/javascript`   | `application/javascript`                              | data   |
| GET    | `/data/css`          | `text/css`                                            | data   |
| GET    | `/data/binary`       | `application/octet-stream`                            | data   |
| GET    | `/data/multi-format` | `application/json`, `application/xml`, `text/csv`     | data   |
| GET    | `/save/report`       | `text/plain` (attachment)                             | save   |
| GET    | `/save/export`       | `application/json` (attachment)                       | save   |
| GET    | `/save/image`        | `image/png` (attachment)                              | save   |
| POST   | `/upload/avatar`     | `multipart/form-data` (1 file field)                  | upload |
| POST   | `/upload/documents`  | `multipart/form-data` (2 file fields)                 | upload |

## How to Run

### Start the mock server

```bash
node examples/integration/content-types-server.mjs
```

The server listens on `http://localhost:4567` and logs all available endpoints on startup.

### Launch spec-tui in another terminal

```bash
npx spec-tui examples/integration/content-types.yaml
```

Browse to any endpoint, send a request, and observe how the TUI renders each content type. For attachment responses, press `w` on the response view to save the file to disk.

## Files included

- `content-types.yaml` -- OpenAPI 3.0.3 spec covering JSON, XML, HTML, CSV, JavaScript, CSS, binary, multi-format, upload, and download endpoints.
- `content-types-server.mjs` -- Node.js mock server implementing all spec endpoints with realistic response bodies.
