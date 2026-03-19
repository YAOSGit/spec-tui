import type { Command } from '../../types/Command/index.js';
import { getTotalFields } from './shared.js';

export const nextFieldCommand: Command = {
	id: 'NEXT_FIELD',
	keys: [{ specialKey: 'down' }],
	displayKey: '↓',
	displayText: 'field',
	footer: 'hidden',
	helpSection: 'Detail',
	helpLabel: 'Next field',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing,
	execute: (p) => {
		const totalFields = getTotalFields(p);
		if (totalFields === 0) return;
		p.navigation.setSelectedFieldIndex(
			(p.navigation.selectedFieldIndex + 1) % totalFields,
		);
	},
};

export const prevFieldCommand: Command = {
	id: 'PREV_FIELD',
	keys: [{ specialKey: 'up' }],
	displayKey: '↑ / ↓',
	displayText: 'field',
	footer: 'priority',
	footerOrder: 0,
	helpSection: 'Detail',
	helpLabel: 'Previous field',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing,
	execute: (p) => {
		const totalFields = getTotalFields(p);
		if (totalFields === 0) return;
		p.navigation.setSelectedFieldIndex(
			(p.navigation.selectedFieldIndex - 1 + totalFields) % totalFields,
		);
	},
};

export const editFieldCommand: Command = {
	id: 'EDIT_FIELD',
	keys: [{ specialKey: 'enter' }],
	displayKey: 'Enter',
	displayText: 'edit',
	footer: 'priority',
	footerOrder: 5,
	helpSection: 'Detail',
	helpLabel: 'Edit selected field value',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing,
	execute: (p) => {
		p.navigation.setIsEditing(true);
	},
};
