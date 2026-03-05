import type { Command } from '../../types/Command/index.js';

export const quitCommand: Command = {
	id: 'QUIT',
	keys: [{ textKey: 'q', ctrl: false }],
	displayText: 'quit',
	footer: 'priority',
	footerOrder: 2,
	helpSection: 'General',
	helpLabel: 'Quit',
	isEnabled: () => true,
	execute: (p) => {
		p.quit();
	},
};
