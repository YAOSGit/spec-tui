import type { Command } from '../../types/Command/index.js';
import {
	generateObjectFromSchema,
	generateValue,
	guessCategory,
} from '../../utils/faker/index.js';
import {
	extractBodySchemaFields,
	isArrayBody,
	serializeBodyArrayFields,
	serializeBodyFields,
} from '../../utils/bodySchema/index.js';

type ArrayContext =
	| { kind: 'bodyArray' }
	| { kind: 'paramArray'; paramName: string; items: string[]; index: number }
	| null;

function getSelectedArrayContext(p: {
	navigation: {
		selectedEndpoint: { parameters: { name: string; schema?: Record<string, unknown> }[]; requestBody?: Record<string, unknown> } | null;
		selectedFieldIndex: number;
		bodyEditMode: string;
		paramArrayItems: Record<string, string[]>;
		currentParamArrayIndices: Record<string, number>;
		paramArrayRawMode: Record<string, boolean>;
	};
}): ArrayContext {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return null;
	const idx = p.navigation.selectedFieldIndex;
	const paramCount = endpoint.parameters.length;

	if (idx < paramCount) {
		const param = endpoint.parameters[idx];
		if (param?.schema?.type === 'array' && !p.navigation.paramArrayRawMode[param.name]) {
			const items = p.navigation.paramArrayItems[param.name] ?? [''];
			const index = p.navigation.currentParamArrayIndices[param.name] ?? 0;
			return { kind: 'paramArray', paramName: param.name, items, index };
		}
		return null;
	}

	// Body field selected
	if (endpoint.requestBody && isArrayBody(endpoint.requestBody)) {
		return { kind: 'bodyArray' };
	}
	return null;
}

function getTotalFields(p: {
	navigation: {
		selectedEndpoint: { parameters: unknown[]; requestBody?: Record<string, unknown> } | null;
		bodyEditMode: string;
	};
}): number {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return 0;
	const paramCount = endpoint.parameters.length;

	if (endpoint.requestBody) {
		if (p.navigation.bodyEditMode === 'form') {
			const fields = extractBodySchemaFields(endpoint.requestBody);
			return paramCount + (fields.length > 0 ? fields.length : 1);
		}
		return paramCount + 1;
	}

	return paramCount;
}

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

export const generateFieldCommand: Command = {
	id: 'GENERATE_FIELD',
	keys: [{ textKey: 'g', ctrl: false, shift: false }],
	displayKey: 'g',
	displayText: 'generate',
	footer: 'optional',
	footerOrder: 6,
	helpSection: 'Detail',
	helpLabel: 'Generate value for selected field',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		p.navigation.selectedEndpoint !== null,
	execute: (p) => {
		const endpoint = p.navigation.selectedEndpoint;
		if (!endpoint) return;
		const idx = p.navigation.selectedFieldIndex;
		const totalParams = endpoint.parameters.length;

		if (idx < totalParams) {
			const param = endpoint.parameters[idx];
			if (!param) return;
			if (param.schema?.type === 'array') {
				const itemSchema = (param.schema.items as Record<string, unknown> | undefined) ?? {};
				const value = generateValue(guessCategory(param.name, itemSchema), itemSchema);
				if (p.navigation.paramArrayRawMode[param.name]) {
					// Raw mode: append comma-separated to paramValues
					const existing = p.navigation.paramValues[param.name] ?? '';
					p.navigation.updateParamValue(param.name, existing ? `${existing}, ${value}` : value);
				} else {
					p.navigation.updateParamArrayItem(param.name, value);
				}
			} else {
				const value = generateValue(guessCategory(param.name, param.schema), param.schema);
				p.navigation.updateParamValue(param.name, value);
			}
		} else if (endpoint.requestBody) {
			if (p.navigation.bodyEditMode === 'form') {
				const fields = extractBodySchemaFields(endpoint.requestBody);
				const bodyFieldIdx = idx - totalParams;
				const field = fields[bodyFieldIdx];
				if (field) {
					if (field.type === 'file') return;
					const category = guessCategory(field.name, field.schema);
					const value = generateValue(category, field.schema);
					if (isArrayBody(endpoint.requestBody)) {
						p.navigation.updateBodyArrayItemField(field.name, value);
					} else {
						p.navigation.updateBodyFieldValue(field.name, value);
					}
				}
			} else {
				const body = generateObjectFromSchema(endpoint.requestBody);
				p.navigation.setBodyValue(JSON.stringify(body, null, 2));
			}
		}
	},
};

export const generateFieldPickerCommand: Command = {
	id: 'GENERATE_FIELD_PICKER',
	keys: [{ textKey: 'm', ctrl: false, shift: false }],
	displayKey: 'm',
	displayText: 'mock type',
	footer: 'hidden',
	helpSection: 'Detail',
	helpLabel: 'Choose mock type for field',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		p.navigation.selectedEndpoint !== null,
	execute: (p) => {
		p.ui.openFakerPicker();
	},
};

function isSelectedParamArray(p: { navigation: { selectedEndpoint: { parameters: { name: string; schema?: Record<string, unknown> }[]; requestBody?: Record<string, unknown> } | null; selectedFieldIndex: number } }): string | null {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return null;
	const idx = p.navigation.selectedFieldIndex;
	if (idx >= endpoint.parameters.length) return null;
	const param = endpoint.parameters[idx];
	return param?.schema?.type === 'array' ? param.name : null;
}

function isSelectedBodyFileField(p: { navigation: { selectedEndpoint: { parameters: unknown[]; requestBody?: Record<string, unknown> } | null; selectedFieldIndex: number; bodyEditMode: string } }): string | null {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint?.requestBody || p.navigation.bodyEditMode !== 'form') return null;
	const idx = p.navigation.selectedFieldIndex - endpoint.parameters.length;
	if (idx < 0) return null;
	const fields = extractBodySchemaFields(endpoint.requestBody);
	const field = fields[idx];
	return field?.type === 'file' ? field.name : null;
}

function getSelectedFieldType(p: {
	navigation: {
		selectedEndpoint: { parameters: { name: string; schema?: Record<string, unknown> }[]; requestBody?: Record<string, unknown> } | null;
		selectedFieldIndex: number;
		bodyEditMode: string;
		paramArrayRawMode: Record<string, boolean>;
	};
}): 'file' | 'boolean' | 'integer' | 'array-param' | null {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return null;
	const idx = p.navigation.selectedFieldIndex;
	const paramCount = endpoint.parameters.length;

	if (idx < paramCount) {
		const param = endpoint.parameters[idx];
		if (!param) return null;
		if (param.schema?.type === 'array') return 'array-param';
		if (param.schema?.type === 'boolean') return 'boolean';
		if (param.schema?.type === 'integer') return 'integer';
		return null;
	}

	if (endpoint.requestBody && p.navigation.bodyEditMode === 'form') {
		const fields = extractBodySchemaFields(endpoint.requestBody);
		const field = fields[idx - paramCount];
		if (!field) return null;
		if (field.type === 'file') return 'file';
		if (field.type === 'boolean') return 'boolean';
		if (field.type === 'integer') return 'integer';
	}
	return null;
}

export const toggleBodyEditModeCommand: Command = {
	id: 'TOGGLE_BODY_EDIT_MODE',
	keys: [{ textKey: 'j', ctrl: false, shift: false }],
	displayKey: 'j',
	displayText: 'form/raw',
	footer: 'optional',
	footerOrder: 7,
	helpSection: 'Detail',
	helpLabel: 'Toggle form / raw editing',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		p.navigation.selectedEndpoint?.requestBody != null,
	execute: (p) => {
		const endpoint = p.navigation.selectedEndpoint;
		if (!endpoint?.requestBody) return;

		const arrayMode = isArrayBody(endpoint.requestBody);

		if (p.navigation.bodyEditMode === 'form') {
			// Form → JSON: serialize current form values into bodyValue
			const fields = extractBodySchemaFields(endpoint.requestBody);
			if (fields.length > 0) {
				const json = arrayMode
					? serializeBodyArrayFields(fields, p.navigation.bodyArrayItems)
					: serializeBodyFields(fields, p.navigation.bodyFieldValues);
				p.navigation.setBodyValue(json);
			}
			p.navigation.setBodyEditMode('json');
		} else {
			// JSON → Form: parse bodyValue into field values
			const fields = extractBodySchemaFields(endpoint.requestBody);
			if (fields.length > 0) {
				try {
					if (arrayMode) {
						const parsed = JSON.parse(p.navigation.bodyValue || '[]') as Record<string, unknown>[];
						if (Array.isArray(parsed)) {
							const items = parsed.map((item) => {
								const vals: Record<string, string> = {};
								for (const field of fields) {
									const val = item[field.name];
									if (val !== undefined) {
										vals[field.name] =
											typeof val === 'string' ? val : JSON.stringify(val);
									}
								}
								return vals;
							});
							p.navigation.setBodyArrayItems(items.length > 0 ? items : [{}]);
							p.navigation.setCurrentBodyItemIndex(0);
						}
					} else {
						const parsed = JSON.parse(p.navigation.bodyValue || '{}') as Record<string, unknown>;
						const newFieldValues: Record<string, string> = {};
						for (const field of fields) {
							const val = parsed[field.name];
							if (val !== undefined) {
								newFieldValues[field.name] =
									typeof val === 'string' ? val : JSON.stringify(val);
							}
						}
						p.navigation.setBodyFieldValues(newFieldValues);
					}
				} catch {
					// If JSON is invalid, keep current field values
				}
			}
			p.navigation.setBodyEditMode('form');
		}

		// Reset field index to first body field
		const paramCount = endpoint.parameters.length;
		p.navigation.setSelectedFieldIndex(paramCount);
	},
};

// --- Array body commands ---

export const addArrayItemCommand: Command = {
	id: 'ADD_ARRAY_ITEM',
	keys: [{ textKey: 'n', ctrl: false, shift: false }],
	displayKey: 'n',
	displayText: 'add item',
	footer: 'optional',
	footerOrder: 8,
	helpSection: 'Detail',
	helpLabel: 'Add array item',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		getSelectedArrayContext(p) !== null,
	execute: (p) => {
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return;
		if (ctx.kind === 'bodyArray') {
			p.navigation.addBodyArrayItem();
		} else {
			p.navigation.addParamArrayItem(ctx.paramName);
		}
	},
};

export const removeArrayItemCommand: Command = {
	id: 'REMOVE_ARRAY_ITEM',
	keys: [{ textKey: 'x', ctrl: false, shift: false }],
	displayKey: 'x',
	displayText: 'remove item',
	footer: 'optional',
	footerOrder: 9,
	helpSection: 'Detail',
	helpLabel: 'Remove current array item',
	isEnabled: (p) => {
		if (
			p.navigation.activePane !== 'detail' ||
			p.navigation.activeView !== 'request' ||
			p.navigation.isEditing
		) return false;
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return false;
		if (ctx.kind === 'bodyArray') return p.navigation.bodyArrayItems.length > 1;
		return ctx.items.length > 1;
	},
	execute: (p) => {
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return;
		if (ctx.kind === 'bodyArray') {
			p.navigation.removeBodyArrayItem(p.navigation.currentBodyItemIndex);
		} else {
			p.navigation.removeParamArrayItem(ctx.paramName);
		}
	},
};

export const prevArrayItemCommand: Command = {
	id: 'PREV_ARRAY_ITEM',
	keys: [{ specialKey: 'left' }],
	displayKey: '← / →',
	displayText: 'item',
	footer: 'priority',
	footerOrder: 1,
	helpSection: 'Detail',
	helpLabel: 'Previous array item',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		getSelectedArrayContext(p) !== null,
	execute: (p) => {
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return;
		if (ctx.kind === 'bodyArray') {
			if (p.navigation.currentBodyItemIndex > 0) {
				p.navigation.setCurrentBodyItemIndex(p.navigation.currentBodyItemIndex - 1);
			}
		} else {
			if (ctx.index > 0) {
				p.navigation.setParamArrayIndex(ctx.paramName, ctx.index - 1);
			}
		}
	},
};

export const nextArrayItemCommand: Command = {
	id: 'NEXT_ARRAY_ITEM',
	keys: [{ specialKey: 'right' }],
	displayKey: '→',
	displayText: 'next item',
	footer: 'hidden',
	helpSection: 'Detail',
	helpLabel: 'Next array item',
	isEnabled: (p) => {
		if (
			p.navigation.activePane !== 'detail' ||
			p.navigation.activeView !== 'request' ||
			p.navigation.isEditing
		) return false;
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return false;
		if (ctx.kind === 'bodyArray') {
			return p.navigation.currentBodyItemIndex < p.navigation.bodyArrayItems.length - 1;
		}
		return ctx.index < ctx.items.length - 1;
	},
	execute: (p) => {
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return;
		if (ctx.kind === 'bodyArray') {
			p.navigation.setCurrentBodyItemIndex(p.navigation.currentBodyItemIndex + 1);
		} else {
			p.navigation.setParamArrayIndex(ctx.paramName, ctx.index + 1);
		}
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

export const toggleFieldEditorModeCommand: Command = {
	id: 'TOGGLE_FIELD_EDITOR_MODE',
	keys: [{ textKey: 't', ctrl: false, shift: false }],
	displayKey: 't',
	displayText: 'toggle mode',
	footer: 'optional',
	footerOrder: 10,
	helpSection: 'Detail',
	helpLabel: 'Toggle field editor mode',
	isEnabled: (p) =>
		p.navigation.activePane === 'detail' &&
		p.navigation.activeView === 'request' &&
		!p.navigation.isEditing &&
		getSelectedFieldType(p) !== null,
	execute: (p) => {
		const fieldType = getSelectedFieldType(p);
		if (!fieldType) return;

		const endpoint = p.navigation.selectedEndpoint;
		if (!endpoint) return;
		const idx = p.navigation.selectedFieldIndex;
		const paramCount = endpoint.parameters.length;

		switch (fieldType) {
			case 'array-param': {
				const param = endpoint.parameters[idx];
				if (param) p.navigation.toggleParamArrayRawMode(param.name);
				break;
			}
			case 'file': {
				const fileName = isSelectedBodyFileField(p);
				if (fileName) p.navigation.toggleFileInputMode(fileName);
				break;
			}
			case 'boolean':
			case 'integer': {
				const fieldKey = idx < paramCount
					? `param:${endpoint.parameters[idx]?.name}`
					: `body:${extractBodySchemaFields(endpoint.requestBody!)[idx - paramCount]?.name}`;
				p.navigation.toggleFieldEditorOverride(fieldKey);
				break;
			}
		}
	},
};
