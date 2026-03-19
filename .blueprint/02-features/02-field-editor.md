---
title: Field Editor
teleport:
  file: src/components/FieldEditor/index.tsx
  line: 239
---

# Dynamic Field Editing

## How it works

The `FieldEditor` component (line 239) renders a type-aware input for each parameter or body field. It inspects the schema type and format to choose the right widget: `BooleanToggle` for booleans, `NumberStepper` for integers, `EnumSelector` for enums, `FilePathInput` or `FileBrowser` for binary fields, and a plain `TextInput` for everything else.

## Key details

Each sub-widget is self-contained with its own `useInput` handler for keyboard interaction. The component also shows metadata like type, required status, location, and description pulled from the OpenAPI parameter or body field schema.

## What to do

Press `o` to teleport to the FieldEditor component.
