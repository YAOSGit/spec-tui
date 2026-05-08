# Basic Example -- Petstore OpenAPI Spec

This example demonstrates the simplest use of spec-tui: loading a local OpenAPI 3.0 YAML file and exploring its endpoints interactively in the terminal.

## What it does

The included `petstore.yaml` defines a minimal Petstore API with three operations:

| Method | Path             | Operation     | Description             |
|--------|------------------|---------------|-------------------------|
| GET    | `/pets`          | `listPets`    | List all pets           |
| POST   | `/pets`          | `createPet`   | Create a pet            |
| GET    | `/pets/{petId}`  | `showPetById` | Info for a specific pet |

The spec includes a `Pet` schema with `id`, `name`, and `tag` fields, query parameters (`limit`), and path parameters (`petId`).

## Setup

No additional setup required -- just point spec-tui at the YAML file.

```bash
npx spec-tui examples/basic/petstore.yaml
```

Or if installed globally:

```bash
spec-tui examples/basic/petstore.yaml
```

## Try it out

Launch the TUI and browse endpoints:

```bash
$ npx spec-tui examples/basic/petstore.yaml
# Opens the interactive TUI with the Petstore spec loaded
# Use arrow keys to navigate endpoints
# Press Enter to inspect an operation
# Press q to quit
```

## Files included

- `petstore.yaml` -- A minimal OpenAPI 3.0.3 spec with CRUD operations for a pet resource.
