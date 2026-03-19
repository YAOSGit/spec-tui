---
title: OpenAPI Parser
teleport:
  file: src/parser/openapi/index.ts
  line: 26
---

# OpenAPI Parser

## How it works

The `parseSpec` function at line 26 is the core parsing entry point. It uses `SwaggerParser.dereference()` to fully resolve all `$ref` pointers in the spec, producing a flat `OpenAPIV3.Document` with no remaining references.

## What it extracts

From the dereferenced document it extracts three things: the base URL from `servers[0]`, all security schemes from `components.securitySchemes`, and every endpoint by iterating paths and HTTP methods. Each endpoint is normalized into the `Endpoint` type with parameters, request body schema, and response schemas.

## What to do

Press `o` to teleport to the `parseSpec` function.
