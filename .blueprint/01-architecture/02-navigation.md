---
title: Navigation Provider
teleport:
  file: src/providers/NavigationProvider/index.tsx
  line: 11
---

# Three-Pane Navigation

## How it works

The `NavigationProvider` at line 11 wraps the app in a React context that manages which pane is focused and which endpoint is selected. It delegates all state logic to `useNavigationState`, keeping the provider itself a thin context wrapper.

## Key concepts

The TUI uses a three-pane layout: a navigator listing endpoints, a detail pane showing the selected endpoint's parameters and responses, and a config pane for building and executing requests. The `useNavigation` hook (re-exported at line 25) gives any component access to navigation state.

## What to do

Press `o` to teleport to the NavigationProvider.
