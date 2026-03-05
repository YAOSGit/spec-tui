import type { Key } from 'ink';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import type { VisibleCommand } from '../../types/VisibleCommand/index.js';
import { useNavigation } from '../NavigationProvider/index.js';
import { useRequestConfig } from '../RequestConfigProvider/index.js';
import { useSpec } from '../SpecProvider/index.js';
import { useUI } from '../UIStateProvider/index.js';
import { COMMANDS } from './CommandsProvider.consts.js';
import type {
	CommandProviders,
	CommandsContextValue,
	CommandsProviderProps,
} from './CommandsProvider.types.js';
import { isKeyMatch } from './CommandsProvider.utils.js';

const CommandsContext = createContext<CommandsContextValue | null>(null);

export const CommandsProvider: React.FC<CommandsProviderProps> = ({
	children,
	onQuit,
}) => {
	const navigation = useNavigation();
	const spec = useSpec();
	const ui = useUI();
	const requestConfig = useRequestConfig();

	const providers: CommandProviders = useMemo(
		() => ({ navigation, spec, ui, requestConfig, quit: onQuit }),
		[navigation, spec, ui, requestConfig, onQuit],
	);

	const handleInput = useCallback(
		(input: string, key: Key) => {
			if (ui.showHelp || ui.showFakerPicker || navigation.activePane === 'config') return;

			for (const command of COMMANDS) {
				if (
					isKeyMatch(key, input, command.keys) &&
					command.isEnabled(providers)
				) {
					command.execute(providers);
					return;
				}
			}
		},
		[providers, ui.showHelp, ui.showFakerPicker, navigation.activePane],
	);

	const getVisibleCommands = useCallback((): VisibleCommand[] => {
		const seen = new Set<string>();
		const priority: VisibleCommand[] = [];
		const optional: VisibleCommand[] = [];

		for (const command of COMMANDS) {
			if (command.footer === 'hidden') continue;

			const displayKey =
				command.displayKey ??
				command.keys
					.map((b) => b.textKey ?? b.specialKey ?? '')
					.filter(Boolean)
					.join('/');
			const dedupeKey = `${displayKey}-${command.displayText}`;
			if (seen.has(dedupeKey)) continue;
			seen.add(dedupeKey);

			if (!command.isEnabled(providers)) continue;

			const entry: VisibleCommand = {
				displayKey,
				displayText: command.displayText,
				priority: command.footer === 'priority',
				footerOrder: command.footerOrder,
			};
			if (command.footer === 'priority') {
				priority.push(entry);
			} else {
				optional.push(entry);
			}
		}

		return [
			...priority.sort(
				(a, b) => (a.footerOrder ?? 999) - (b.footerOrder ?? 999),
			),
			...optional.sort(
				(a, b) => (a.footerOrder ?? 999) - (b.footerOrder ?? 999),
			),
		];
	}, [providers]);

	const value: CommandsContextValue = useMemo(
		() => ({ handleInput, getVisibleCommands }),
		[handleInput, getVisibleCommands],
	);

	return (
		<CommandsContext.Provider value={value}>
			{children}
		</CommandsContext.Provider>
	);
};

export const useCommands = (): CommandsContextValue => {
	const context = useContext(CommandsContext);
	if (!context) {
		throw new Error('useCommands must be used within a CommandsProvider');
	}
	return context;
};
