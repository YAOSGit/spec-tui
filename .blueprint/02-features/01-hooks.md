---
title: Hook Architecture
teleport:
  file: src/hooks/index.ts
  line: 1
---

# Hook Architecture

## How it works

spec-tui organizes its state into 9 hooks exported from `src/hooks/index.ts`. The pattern separates context consumers (`useNavigation`, `useSpec`, `useRequestConfig`, `useUI`, `useCommands`) from state owners (`useNavigationState`, `useSpecState`, `useRequestConfigState`, `useUIState`).

## Why the split

State hooks hold the actual `useState`/`useReducer` logic and are consumed by a single provider each. Consumer hooks read from context and are used throughout the component tree. This split keeps state management centralized while giving components simple, focused APIs.

## What to do

Press `o` to teleport to the hooks barrel file.
