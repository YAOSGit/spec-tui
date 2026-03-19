/**
 * @deprecated — Help is now provided by the toolkit's shared commands.
 * This module is kept only to avoid breaking any stale imports.
 * Use `COMMANDS.find(c => c.id === 'HELP')` from the provider instead.
 */
import type { Command } from '../../types/Command/index.js';

export const helpCommand: Command = {
	id: 'HELP',
	keys: [{ textKey: 'h', ctrl: false }],
	displayKey: 'h',
	displayText: 'help',
	footer: 'priority',
	footerOrder: 1,
	helpSection: 'General',
	helpLabel: 'Help',
	isEnabled: (p) => p.ui.activeOverlay === 'none',
	execute: (p) => {
		p.ui.setActiveOverlay('help');
	},
};
