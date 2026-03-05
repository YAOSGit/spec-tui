import type { Command } from '../../types/Command/index.js';

export const navigateUpCommand: Command = {
	id: 'NAVIGATE_UP',
	keys: [{ specialKey: 'up' }],
	displayKey: '↑ / ↓',
	displayText: 'move',
	footer: 'priority',
	footerOrder: 0,
	helpSection: 'Navigator',
	helpLabel: 'Move up',
	isEnabled: (p) => p.navigation.activePane === 'navigator',
	execute: (p) => {
		if (p.navigation.selectedIndex > 0) {
			p.navigation.setSelectedIndex(p.navigation.selectedIndex - 1);
		}
	},
};

export const navigateDownCommand: Command = {
	id: 'NAVIGATE_DOWN',
	keys: [{ specialKey: 'down' }],
	displayKey: '↓',
	displayText: 'down',
	footer: 'hidden',
	helpSection: 'Navigator',
	helpLabel: 'Move down',
	isEnabled: (p) =>
		p.navigation.activePane === 'navigator' &&
		p.navigation.selectedIndex < p.spec.endpoints.length - 1,
	execute: (p) => {
		p.navigation.setSelectedIndex(p.navigation.selectedIndex + 1);
	},
};
