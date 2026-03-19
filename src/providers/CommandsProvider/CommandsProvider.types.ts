import type { BaseDeps } from '@yaos-git/toolkit/types';
import type { Key } from 'ink';
import type { Command } from '../../types/Command/index.js';
import type { VisibleCommand } from '../../types/VisibleCommand/index.js';
import type { NavigationContextValue } from '../NavigationProvider/NavigationProvider.types.js';
import type { RequestConfigContextValue } from '../RequestConfigProvider/RequestConfigProvider.types.js';
import type { SpecContextValue } from '../SpecProvider/SpecProvider.types.js';
import type { UIStateContextValue } from '../UIStateProvider/UIStateProvider.types.js';

/**
 * Bridged UI type that satisfies `OverlayState & { cycleFocus }` (required by
 * `BaseDeps`) while keeping spec-tui's boolean-flag helpers available for
 * existing commands.
 */
export type BridgedUI = BaseDeps['ui'] & UIStateContextValue;

/**
 * `SpecTuiDeps` extends `BaseDeps` so that the toolkit's
 * `createCommandsProvider<SpecTuiDeps>()` can provide shared commands
 * (help, quit, etc.) while spec-tui's own commands access project-specific
 * context through the extra properties.
 */
export type SpecTuiDeps = BaseDeps & {
	navigation: NavigationContextValue;
	spec: SpecContextValue;
	ui: BridgedUI;
	requestConfig: RequestConfigContextValue;
};

/**
 * Backward-compatible alias so existing test files that import
 * `CommandProviders` continue to work without changes to every import.
 */
export type CommandProviders = SpecTuiDeps;

export interface CommandsProviderProps {
	children: React.ReactNode;
	onQuit: () => void;
}

export interface CommandsContextValue {
	handleInput: (input: string, key: Key) => void;
	getVisibleCommands: () => VisibleCommand[];
	confirmation: { message: string; onConfirm: () => void } | null;
	commands: Command[];
	deps: SpecTuiDeps;
}
