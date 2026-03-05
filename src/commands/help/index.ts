import type { Command } from '../../types/Command/index.js';

export const helpCommand: Command = {
	id: 'HELP',
	keys: [{ textKey: 'h', ctrl: false }],
	displayText: 'help',
	footer: 'priority',
	footerOrder: 1,
	helpSection: 'General',
	helpLabel: 'Help',
	isEnabled: () => true,
	execute: (p) => {
		p.ui.toggleHelp();
	},
};
