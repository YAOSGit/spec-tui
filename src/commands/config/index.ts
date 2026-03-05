import type { Command } from '../../types/Command/index.js';

export const navigateConfigCommand: Command = {
	id: 'NAVIGATE_CONFIG',
	keys: [{ specialKey: 'up' }, { specialKey: 'down' }],
	displayKey: '↑ / ↓',
	displayText: 'move',
	footer: 'priority',
	footerOrder: 0,
	helpSection: 'Config',
	helpLabel: 'Navigate config items',
	isEnabled: (p) => p.navigation.activePane === 'config',
	execute: () => {},
};

export const switchConfigSectionCommand: Command = {
	id: 'SWITCH_CONFIG_SECTION',
	keys: [{ specialKey: 'tab' }],
	displayKey: 'Tab',
	displayText: 'switch section',
	footer: 'priority',
	footerOrder: 1,
	helpSection: 'Config',
	helpLabel: 'Switch between auth and headers',
	isEnabled: (p) => p.navigation.activePane === 'config',
	execute: () => {},
};

export const closeConfigCommand: Command = {
	id: 'CLOSE_CONFIG',
	keys: [{ specialKey: 'esc' }],
	displayKey: 'ESC',
	displayText: 'back',
	footer: 'priority',
	footerOrder: 4,
	helpSection: 'Config',
	helpLabel: 'Close config',
	isEnabled: (p) => p.navigation.activePane === 'config',
	execute: () => {},
};

export const openConfigCommand: Command = {
	id: 'OPEN_CONFIG',
	keys: [{ textKey: 'c', ctrl: false }],
	displayKey: 'c',
	displayText: 'config',
	footer: 'optional',
	footerOrder: 8,
	helpSection: 'General',
	helpLabel: 'Configure auth & headers',
	isEnabled: (p) => !p.ui.showHelp && p.navigation.activePane !== 'config',
	execute: (p) => {
		p.navigation.setActivePane('config');
	},
};
