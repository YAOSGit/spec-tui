import type { Command } from '../../types/Command/index.js';

export const toggleViewCommand: Command = {
	id: 'TOGGLE_VIEW',
	keys: [{ specialKey: 'tab' }],
	displayKey: 'Tab',
	displayText: 'toggle view',
	footer: 'priority',
	footerOrder: 2,
	helpSection: 'Detail',
	helpLabel: 'Switch between Request and Response',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' && !p.navigation.isEditing,
	execute: (p) => {
		p.navigation.setActiveView(
			p.navigation.activeView === 'request' ? 'response' : 'request',
		);
	},
};

export const saveResponseCommand: Command = {
	id: 'SAVE_RESPONSE',
	keys: [{ textKey: 'w', ctrl: false, shift: false }],
	displayKey: 'w',
	displayText: 'save',
	footer: 'optional',
	footerOrder: 11,
	helpSection: 'Detail',
	helpLabel: 'Save response body to file',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'response' &&
		!p.navigation.isEditing &&
		!p.ui.saveMode &&
		p.navigation.selectedEndpoint !== null,
	execute: (p) => {
		p.ui.setSaveMode(true);
	},
};
