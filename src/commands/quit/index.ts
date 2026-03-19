/**
 * @deprecated — Quit is now provided by the toolkit's shared commands.
 * This module is kept only to avoid breaking any stale imports.
 * Use `COMMANDS.find(c => c.id === 'QUIT')` from the provider instead.
 */
import type { Command } from '../../types/Command/index.js';

export const quitCommand: Command = {
	id: 'QUIT',
	keys: [{ textKey: 'q', ctrl: false }],
	displayKey: 'q',
	displayText: 'quit',
	footer: 'priority',
	footerOrder: 2,
	helpSection: 'General',
	helpLabel: 'Quit',
	isEnabled: () => true,
	execute: (p) => {
		p.onQuit();
	},
};
