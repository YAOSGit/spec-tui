import { createCommandsProvider } from '@yaos-git/toolkit/tui/commands';
import type { PendingConfirmation } from '@yaos-git/toolkit/types';
import type { Key } from 'ink';
import type React from 'react';
import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { VisibleCommand } from '../../types/VisibleCommand/index.js';
import { useNavigation } from '../../hooks/useNavigation/index.js';
import { useRequestConfig } from '../../hooks/useRequestConfig/index.js';
import { useSpec } from '../../hooks/useSpec/index.js';
import { useUI } from '../../hooks/useUI/index.js';
import { GUARDED_PROJECT_COMMANDS } from './CommandsProvider.consts.js';
import type {
	BridgedUI,
	CommandsContextValue,
	CommandsProviderProps,
	SpecTuiDeps,
} from './CommandsProvider.types.js';
import { isKeyMatch } from './CommandsProvider.utils.js';

// ---------------------------------------------------------------------------
// Use createCommandsProvider to get the merged COMMANDS list (project +
// shared commands like help, quit, scroll, cycleFocus).
// ---------------------------------------------------------------------------
const toolkit = createCommandsProvider<SpecTuiDeps>(
	GUARDED_PROJECT_COMMANDS,
);

/** Full command list including toolkit-provided shared commands. */
export const COMMANDS = toolkit.COMMANDS;

// ---------------------------------------------------------------------------
// Thin compatibility wrapper
// ---------------------------------------------------------------------------
// spec-tui's app.tsx calls `commands.handleInput(input, key)` from its own
// `useInput` handler.  The toolkit's provider wires `useInput` internally,
// but we need the explicit `handleInput` entry-point so the app can gate
// input (e.g. skip during save-mode / faker picker).
//
// We therefore keep our own React context that mirrors the old API while
// delegating to the toolkit-generated COMMANDS array.
// ---------------------------------------------------------------------------

export const CommandsContext = createContext<CommandsContextValue | null>(null);

/**
 * Bridge spec-tui's boolean-flag UI state into the `OverlayState`
 * interface required by `BaseDeps`.
 */
function useBridgedUI(): BridgedUI {
	const ui = useUI();
	const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(null);

	const activeOverlay = useMemo<string>(() => {
		if (confirmation) return 'confirmation';
		if (ui.showHelp) return 'help';
		if (ui.showFakerPicker) return 'faker';
		return 'none';
	}, [ui.showHelp, ui.showFakerPicker, confirmation]);

	const setActiveOverlay = useCallback(
		(overlay: string) => {
			// Close everything first
			if (ui.showHelp) ui.closeHelp();
			if (ui.showFakerPicker) ui.closeFakerPicker();
			setConfirmation(null);

			// Open the requested overlay
			if (overlay === 'help') ui.openHelp();
			else if (overlay === 'faker') ui.openFakerPicker();
		},
		[ui],
	);

	const requestConfirmation = useCallback(
		(message: string, onConfirm: () => void) => {
			setConfirmation({ message, onConfirm });
		},
		[],
	);

	const clearConfirmation = useCallback(() => {
		setConfirmation(null);
	}, []);

	return useMemo(
		() => ({
			...ui,
			activeOverlay,
			setActiveOverlay,
			confirmation,
			requestConfirmation,
			clearConfirmation,
			cycleFocus: () => {},
		}),
		[ui, activeOverlay, setActiveOverlay, confirmation, requestConfirmation, clearConfirmation],
	);
}

const CONFIRM_YES = [{ textKey: 'y' }, { specialKey: 'return' }];
const CONFIRM_NO = [{ textKey: 'n' }, { specialKey: 'escape' }];

export const CommandsProvider: React.FC<CommandsProviderProps> = ({
	children,
	onQuit,
}) => {
	const navigation = useNavigation();
	const spec = useSpec();
	const bridgedUI = useBridgedUI();
	const requestConfig = useRequestConfig();

	const deps: SpecTuiDeps = useMemo(
		() => ({
			navigation,
			spec,
			ui: bridgedUI,
			requestConfig,
			onQuit,
		}),
		[navigation, spec, bridgedUI, requestConfig, onQuit],
	);

	const pendingCommandRef = useRef<(typeof COMMANDS)[number] | null>(null);

	const handleInput = useCallback(
		(input: string, key: Key) => {
			// Confirmation mode: y/Enter/same-key confirms, n/Esc cancels
			if (bridgedUI.confirmation) {
				if (
					isKeyMatch(key, input, CONFIRM_YES) ||
					(pendingCommandRef.current &&
						isKeyMatch(key, input, pendingCommandRef.current.keys))
				) {
					bridgedUI.confirmation.onConfirm();
					bridgedUI.clearConfirmation();
					pendingCommandRef.current = null;
				} else if (isKeyMatch(key, input, CONFIRM_NO)) {
					bridgedUI.clearConfirmation();
					pendingCommandRef.current = null;
				}
				return;
			}

			// Global guard: skip when overlay is active or config pane owns input
			if (
				bridgedUI.activeOverlay !== 'none' ||
				navigation.activePane === 'config'
			)
				return;

			for (const command of COMMANDS) {
				if (
					isKeyMatch(key, input, command.keys) &&
					command.isEnabled(deps)
				) {
					if (command.needsConfirmation?.(deps)) {
						const message =
							typeof command.confirmMessage === 'function'
								? command.confirmMessage(deps)
								: (command.confirmMessage ?? 'Are you sure?');
						pendingCommandRef.current = command;
						bridgedUI.requestConfirmation(message, () =>
							command.execute(deps),
						);
						return;
					}
					command.execute(deps);
					return;
				}
			}
		},
		[deps, bridgedUI, navigation.activePane],
	);

	const getVisibleCommands = useCallback((): VisibleCommand[] => {
		const seen = new Set<string>();
		const priority: VisibleCommand[] = [];
		const optional: VisibleCommand[] = [];

		for (const command of COMMANDS) {
			if (command.footer === 'hidden') continue;

			const displayKey =
				command.displayKey ||
				command.keys
					.map((b) => b.textKey ?? b.specialKey ?? '')
					.filter(Boolean)
					.join('/');
			const dedupeKey = `${displayKey}-${command.displayText}`;
			if (seen.has(dedupeKey)) continue;
			seen.add(dedupeKey);

			if (!command.isEnabled(deps)) continue;

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
	}, [deps]);

	const value: CommandsContextValue = useMemo(
		() => ({ handleInput, getVisibleCommands, confirmation: bridgedUI.confirmation, commands: COMMANDS, deps }),
		[handleInput, getVisibleCommands, bridgedUI.confirmation, deps],
	);

	return (
		<CommandsContext.Provider value={value}>
			{children}
		</CommandsContext.Provider>
	);
};

export { useCommands } from '../../hooks/useCommands/index.js';
