import type { Key } from 'ink';
import type { VisibleCommand } from '../../types/VisibleCommand/index.js';
import type { NavigationContextValue } from '../NavigationProvider/NavigationProvider.types.js';
import type { RequestConfigContextValue } from '../RequestConfigProvider/RequestConfigProvider.types.js';
import type { SpecContextValue } from '../SpecProvider/SpecProvider.types.js';
import type { UIStateContextValue } from '../UIStateProvider/UIStateProvider.types.js';

export interface CommandsProviderProps {
	children: React.ReactNode;
	onQuit: () => void;
}

export interface CommandProviders {
	navigation: NavigationContextValue;
	spec: SpecContextValue;
	ui: UIStateContextValue;
	requestConfig: RequestConfigContextValue;
	quit: () => void;
}

export interface CommandsContextValue {
	handleInput: (input: string, key: Key) => void;
	getVisibleCommands: () => VisibleCommand[];
}
