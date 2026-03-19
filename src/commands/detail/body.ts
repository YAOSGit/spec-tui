import type { Command } from '../../types/Command/index.js';
import {
	extractBodySchemaFields,
	isArrayBody,
	serializeBodyArrayFields,
	serializeBodyFields,
} from '../../utils/bodySchema/index.js';
import {
	generateObjectFromSchema,
	generateValue,
	guessCategory,
} from '../../utils/faker/index.js';
import {
	getSelectedArrayContext,
	getSelectedFieldType,
	isSelectedBodyFileField,
} from './shared.js';

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
				const itemSchema =
					(param.schema.items as Record<string, unknown> | undefined) ?? {};
				const value = generateValue(
					guessCategory(param.name, itemSchema),
					itemSchema,
				);
				if (p.navigation.paramArrayRawMode[param.name]) {
					// Raw mode: append comma-separated to paramValues
					const existing = p.navigation.paramValues[param.name] ?? '';
					p.navigation.updateParamValue(
						param.name,
						existing ? `${existing}, ${value}` : value,
					);
				} else {
					p.navigation.updateParamArrayItem(param.name, value);
				}
			} else {
				const value = generateValue(
					guessCategory(param.name, param.schema),
					param.schema,
				);
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
						const parsed = JSON.parse(p.navigation.bodyValue || '[]') as Record<
							string,
							unknown
						>[];
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
						const parsed = JSON.parse(p.navigation.bodyValue || '{}') as Record<
							string,
							unknown
						>;
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
		)
			return false;
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
				p.navigation.setCurrentBodyItemIndex(
					p.navigation.currentBodyItemIndex - 1,
				);
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
		)
			return false;
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return false;
		if (ctx.kind === 'bodyArray') {
			return (
				p.navigation.currentBodyItemIndex <
				p.navigation.bodyArrayItems.length - 1
			);
		}
		return ctx.index < ctx.items.length - 1;
	},
	execute: (p) => {
		const ctx = getSelectedArrayContext(p);
		if (!ctx) return;
		if (ctx.kind === 'bodyArray') {
			p.navigation.setCurrentBodyItemIndex(
				p.navigation.currentBodyItemIndex + 1,
			);
		} else {
			p.navigation.setParamArrayIndex(ctx.paramName, ctx.index + 1);
		}
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
				const fieldKey =
					idx < paramCount
						? `param:${endpoint.parameters[idx]?.name}`
						: `body:${endpoint.requestBody ? extractBodySchemaFields(endpoint.requestBody)[idx - paramCount]?.name : undefined}`;
				p.navigation.toggleFieldEditorOverride(fieldKey);
				break;
			}
		}
	},
};
