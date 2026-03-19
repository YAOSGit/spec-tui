import type { Command } from '../../types/Command/index.js';

export const openDetailCommand: Command = {
	id: 'OPEN_DETAIL',
	keys: [{ specialKey: 'enter' }],
	displayKey: 'Enter',
	displayText: 'open',
	footer: 'priority',
	footerOrder: 3,
	helpSection: 'Navigator',
	helpLabel: 'Open endpoint detail',
	isEnabled: (p) =>
		p.navigation.activePane === 'navigator' && p.spec.endpoints.length > 0,
	execute: (p) => {
		const endpoint = p.spec.endpoints[p.navigation.selectedIndex];
		if (!endpoint) return;
		p.navigation.setSelectedEndpoint(endpoint);
		p.navigation.setParamValues({});
		p.navigation.setBodyValue('');
		p.navigation.setSelectedFieldIndex(0);
		p.navigation.setIsEditing(false);
		p.navigation.setActiveView('request');
		p.navigation.setActivePane('detail');
		p.navigation.setBodyFieldValues({});
		p.navigation.setBodyEditMode('form');
		p.navigation.setBodyArrayItems([{}]);
		p.navigation.setCurrentBodyItemIndex(0);
		p.navigation.setParamArrayItems({});
		p.navigation.setCurrentParamArrayIndices({});
		p.navigation.setParamArrayRawMode({});
		p.navigation.setFileInputMode({});
		p.navigation.setFieldEditorOverride({});
	},
};

export const closeDetailCommand: Command = {
	id: 'CLOSE_DETAIL',
	keys: [{ specialKey: 'esc' }],
	displayKey: 'ESC',
	displayText: 'back',
	footer: 'priority',
	footerOrder: 4,
	helpSection: 'Detail',
	helpLabel: 'Back to navigator / stop editing',
	isEnabled: (p) => p.navigation.activePane === 'detail',
	execute: (p) => {
		if (p.navigation.isEditing) {
			p.navigation.setIsEditing(false);
			return;
		}
		p.navigation.setActivePane('navigator');
		p.navigation.setSelectedEndpoint(null);
	},
};
