import { describe, expect, it, vi } from 'vitest';
import type { CommandProviders } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';
import {
	closeDetailCommand,
	generateFieldCommand,
	nextFieldCommand,
	openDetailCommand,
	prevFieldCommand,
	saveResponseCommand,
	toggleViewCommand,
} from './index.js';

// ---------------------------------------------------------------------------
// Mock external dependencies used by generateFieldCommand
// ---------------------------------------------------------------------------

vi.mock('../../utils/faker/index.js', () => ({
	generateValue: vi.fn(() => 'mock-value'),
	guessCategory: vi.fn(() => 'word'),
	generateObjectFromSchema: vi.fn(() => ({ key: 'generated' })),
}));

vi.mock('../../utils/bodySchema/index.js', () => ({
	extractBodySchemaFields: vi.fn((rb: Record<string, unknown>) => {
		// Return a simple field list that tests can control via requestBody.properties
		const props = rb.properties as
			| Record<string, Record<string, unknown>>
			| undefined;
		if (!props) {
			// For array bodies, look inside items
			const items = rb.items as Record<string, unknown> | undefined;
			if (items?.properties) {
				const itemProps = items.properties as Record<
					string,
					Record<string, unknown>
				>;
				return Object.entries(itemProps).map(([name, s]) => ({
					name,
					type: (s.format === 'binary' ? 'file' : s.type) ?? 'string',
					required: false,
					schema: s,
				}));
			}
			return [];
		}
		return Object.entries(props).map(([name, s]) => ({
			name,
			type: (s.format === 'binary' ? 'file' : s.type) ?? 'string',
			required: false,
			schema: s,
		}));
	}),
	isArrayBody: vi.fn((rb: Record<string, unknown>) => rb.type === 'array'),
	serializeBodyFields: vi.fn(() => '{}'),
	serializeBodyArrayFields: vi.fn(() => '[]'),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEndpoint(overrides: Partial<Endpoint> = {}): Endpoint {
	return {
		method: 'get',
		path: '/test',
		summary: 'Test',
		tags: [],
		parameters: [],
		responses: {},
		deprecated: false,
		contentTypes: { requestContentTypes: [], responseContentTypes: {} },
		...overrides,
	};
}

/**
 * Build a fully mocked CommandProviders object.
 * Every setter / mutator is a vi.fn().
 */
function makeMockProviders(
	overrides: {
		navigation?: Partial<CommandProviders['navigation']>;
		spec?: Partial<CommandProviders['spec']>;
		ui?: Partial<CommandProviders['ui']>;
		requestConfig?: Partial<CommandProviders['requestConfig']>;
	} = {},
): CommandProviders {
	const navigation: CommandProviders['navigation'] = {
		selectedIndex: 0,
		setSelectedIndex: vi.fn(),
		activePane: 'navigator',
		setActivePane: vi.fn(),
		selectedEndpoint: null,
		setSelectedEndpoint: vi.fn(),
		selectedFieldIndex: 0,
		setSelectedFieldIndex: vi.fn(),
		isEditing: false,
		setIsEditing: vi.fn(),
		activeView: 'request',
		setActiveView: vi.fn(),
		paramValues: {},
		setParamValues: vi.fn(),
		updateParamValue: vi.fn(),
		bodyValue: '',
		setBodyValue: vi.fn(),
		requestHistory: [],
		addHistoryEntry: vi.fn(),
		bodyEditMode: 'form',
		setBodyEditMode: vi.fn(),
		bodyFieldValues: {},
		setBodyFieldValues: vi.fn(),
		updateBodyFieldValue: vi.fn(),
		bodyArrayItems: [{}],
		setBodyArrayItems: vi.fn(),
		currentBodyItemIndex: 0,
		setCurrentBodyItemIndex: vi.fn(),
		addBodyArrayItem: vi.fn(),
		removeBodyArrayItem: vi.fn(),
		updateBodyArrayItemField: vi.fn(),
		paramArrayItems: {},
		setParamArrayItems: vi.fn(),
		currentParamArrayIndices: {},
		setCurrentParamArrayIndices: vi.fn(),
		addParamArrayItem: vi.fn(),
		removeParamArrayItem: vi.fn(),
		updateParamArrayItem: vi.fn(),
		setParamArrayIndex: vi.fn(),
		paramArrayRawMode: {},
		setParamArrayRawMode: vi.fn(),
		toggleParamArrayRawMode: vi.fn(),
		fileInputMode: {},
		setFileInputMode: vi.fn(),
		toggleFileInputMode: vi.fn(),
		fieldEditorOverride: {},
		setFieldEditorOverride: vi.fn(),
		toggleFieldEditorOverride: vi.fn(),
		...overrides.navigation,
	};

	const spec: CommandProviders['spec'] = {
		endpoints: [],
		specTitle: 'Test',
		baseUrl: 'http://localhost',
		securitySchemes: [],
		loading: false,
		error: null,
		...overrides.spec,
	};

	const ui: CommandProviders['ui'] = {
		showHelp: false,
		showFakerPicker: false,
		saveMode: false,
		setSaveMode: vi.fn(),
		openHelp: vi.fn(),
		closeHelp: vi.fn(),
		toggleHelp: vi.fn(),
		openFakerPicker: vi.fn(),
		closeFakerPicker: vi.fn(),
		...overrides.ui,
	};

	const requestConfig: CommandProviders['requestConfig'] = {
		globalHeaders: {},
		setGlobalHeaders: vi.fn(),
		addHeader: vi.fn(),
		removeHeader: vi.fn(),
		updateHeader: vi.fn(),
		authConfig: { type: 'none' },
		setAuthConfig: vi.fn(),
		...overrides.requestConfig,
	};

	return {
		navigation,
		spec,
		ui,
		requestConfig,
		quit: vi.fn(),
	};
}

// ===========================================================================
// openDetailCommand
// ===========================================================================

describe('openDetailCommand', () => {
	describe('isEnabled', () => {
		it('returns true when activePane is navigator and endpoints exist', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'navigator' },
				spec: { endpoints: [makeEndpoint()] },
			});
			expect(openDetailCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when activePane is not navigator', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'detail' },
				spec: { endpoints: [makeEndpoint()] },
			});
			expect(openDetailCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when endpoints list is empty', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'navigator' },
				spec: { endpoints: [] },
			});
			expect(openDetailCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('sets correct state for the selected endpoint', () => {
			const endpoint = makeEndpoint({ path: '/pets' });
			const p = makeMockProviders({
				navigation: { selectedIndex: 0 },
				spec: { endpoints: [endpoint] },
			});

			openDetailCommand.execute(p);

			expect(p.navigation.setSelectedEndpoint).toHaveBeenCalledWith(endpoint);
			expect(p.navigation.setParamValues).toHaveBeenCalledWith({});
			expect(p.navigation.setBodyValue).toHaveBeenCalledWith('');
			expect(p.navigation.setSelectedFieldIndex).toHaveBeenCalledWith(0);
			expect(p.navigation.setIsEditing).toHaveBeenCalledWith(false);
			expect(p.navigation.setActiveView).toHaveBeenCalledWith('request');
			expect(p.navigation.setActivePane).toHaveBeenCalledWith('detail');
			expect(p.navigation.setBodyFieldValues).toHaveBeenCalledWith({});
			expect(p.navigation.setBodyEditMode).toHaveBeenCalledWith('form');
			expect(p.navigation.setBodyArrayItems).toHaveBeenCalledWith([{}]);
			expect(p.navigation.setCurrentBodyItemIndex).toHaveBeenCalledWith(0);
			expect(p.navigation.setParamArrayItems).toHaveBeenCalledWith({});
			expect(p.navigation.setCurrentParamArrayIndices).toHaveBeenCalledWith({});
			expect(p.navigation.setParamArrayRawMode).toHaveBeenCalledWith({});
			expect(p.navigation.setFileInputMode).toHaveBeenCalledWith({});
			expect(p.navigation.setFieldEditorOverride).toHaveBeenCalledWith({});
		});

		it('does nothing when selectedIndex points to undefined endpoint', () => {
			const p = makeMockProviders({
				navigation: { selectedIndex: 5 },
				spec: { endpoints: [] },
			});
			openDetailCommand.execute(p);
			expect(p.navigation.setSelectedEndpoint).not.toHaveBeenCalled();
		});
	});
});

// ===========================================================================
// closeDetailCommand
// ===========================================================================

describe('closeDetailCommand', () => {
	describe('isEnabled', () => {
		it('returns true when activePane is detail', () => {
			const p = makeMockProviders({ navigation: { activePane: 'detail' } });
			expect(closeDetailCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when activePane is not detail', () => {
			const p = makeMockProviders({ navigation: { activePane: 'navigator' } });
			expect(closeDetailCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('stops editing when isEditing is true (does not go back to navigator)', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'detail', isEditing: true },
			});
			closeDetailCommand.execute(p);

			expect(p.navigation.setIsEditing).toHaveBeenCalledWith(false);
			expect(p.navigation.setActivePane).not.toHaveBeenCalled();
			expect(p.navigation.setSelectedEndpoint).not.toHaveBeenCalled();
		});

		it('goes back to navigator when isEditing is false', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'detail', isEditing: false },
			});
			closeDetailCommand.execute(p);

			expect(p.navigation.setActivePane).toHaveBeenCalledWith('navigator');
			expect(p.navigation.setSelectedEndpoint).toHaveBeenCalledWith(null);
		});
	});
});

// ===========================================================================
// nextFieldCommand / prevFieldCommand (wrapping)
// ===========================================================================

describe('nextFieldCommand', () => {
	describe('isEnabled', () => {
		it('returns true when on detail pane, request view, not editing', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: false,
				},
			});
			expect(nextFieldCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when editing', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: true,
				},
			});
			expect(nextFieldCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when on response view', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'response',
					isEditing: false,
				},
			});
			expect(nextFieldCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('advances to next field index', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{ name: 'a', location: 'query', required: false, schema: {} },
					{ name: 'b', location: 'query', required: false, schema: {} },
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
				},
			});
			nextFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).toHaveBeenCalledWith(1);
		});

		it('wraps around to 0 after the last field', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{ name: 'a', location: 'query', required: false, schema: {} },
					{ name: 'b', location: 'query', required: false, schema: {} },
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 1,
					bodyEditMode: 'form',
				},
			});
			nextFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).toHaveBeenCalledWith(0);
		});

		it('does nothing when there are no fields', () => {
			const endpoint = makeEndpoint({ parameters: [] });
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
				},
			});
			nextFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).not.toHaveBeenCalled();
		});
	});
});

describe('prevFieldCommand', () => {
	describe('isEnabled', () => {
		it('returns true when on detail pane, request view, not editing', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: false,
				},
			});
			expect(prevFieldCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when not on detail pane', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'navigator',
					activeView: 'request',
					isEditing: false,
				},
			});
			expect(prevFieldCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('goes to previous field index', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{ name: 'a', location: 'query', required: false, schema: {} },
					{ name: 'b', location: 'query', required: false, schema: {} },
					{ name: 'c', location: 'query', required: false, schema: {} },
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 2,
					bodyEditMode: 'form',
				},
			});
			prevFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).toHaveBeenCalledWith(1);
		});

		it('wraps around to last field when at index 0', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{ name: 'a', location: 'query', required: false, schema: {} },
					{ name: 'b', location: 'query', required: false, schema: {} },
					{ name: 'c', location: 'query', required: false, schema: {} },
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
				},
			});
			prevFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).toHaveBeenCalledWith(2);
		});

		it('does nothing when there are no fields', () => {
			const endpoint = makeEndpoint({ parameters: [] });
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
				},
			});
			prevFieldCommand.execute(p);
			expect(p.navigation.setSelectedFieldIndex).not.toHaveBeenCalled();
		});
	});
});

// ===========================================================================
// toggleViewCommand
// ===========================================================================

describe('toggleViewCommand', () => {
	describe('isEnabled', () => {
		it('returns true when on detail pane and not editing', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'detail', isEditing: false },
			});
			expect(toggleViewCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when editing', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'detail', isEditing: true },
			});
			expect(toggleViewCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when not on detail pane', () => {
			const p = makeMockProviders({
				navigation: { activePane: 'navigator', isEditing: false },
			});
			expect(toggleViewCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('switches from request to response', () => {
			const p = makeMockProviders({
				navigation: { activeView: 'request' },
			});
			toggleViewCommand.execute(p);
			expect(p.navigation.setActiveView).toHaveBeenCalledWith('response');
		});

		it('switches from response to request', () => {
			const p = makeMockProviders({
				navigation: { activeView: 'response' },
			});
			toggleViewCommand.execute(p);
			expect(p.navigation.setActiveView).toHaveBeenCalledWith('request');
		});
	});
});

// ===========================================================================
// saveResponseCommand
// ===========================================================================

describe('saveResponseCommand', () => {
	describe('isEnabled', () => {
		it('returns true when on detail/response view, not editing, not saveMode, endpoint selected', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'response',
					isEditing: false,
					selectedEndpoint: makeEndpoint(),
				},
				ui: { saveMode: false },
			});
			expect(saveResponseCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when on request view', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: false,
					selectedEndpoint: makeEndpoint(),
				},
				ui: { saveMode: false },
			});
			expect(saveResponseCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when isEditing is true', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'response',
					isEditing: true,
					selectedEndpoint: makeEndpoint(),
				},
				ui: { saveMode: false },
			});
			expect(saveResponseCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when saveMode is already true', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'response',
					isEditing: false,
					selectedEndpoint: makeEndpoint(),
				},
				ui: { saveMode: true },
			});
			expect(saveResponseCommand.isEnabled(p)).toBe(false);
		});

		it('returns false when no endpoint is selected', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'response',
					isEditing: false,
					selectedEndpoint: null,
				},
				ui: { saveMode: false },
			});
			expect(saveResponseCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('calls setSaveMode(true)', () => {
			const p = makeMockProviders();
			saveResponseCommand.execute(p);
			expect(p.ui.setSaveMode).toHaveBeenCalledWith(true);
		});
	});
});

// ===========================================================================
// generateFieldCommand
// ===========================================================================

describe('generateFieldCommand', () => {
	describe('isEnabled', () => {
		it('returns true when on detail/request view, not editing, endpoint selected', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: false,
					selectedEndpoint: makeEndpoint(),
				},
			});
			expect(generateFieldCommand.isEnabled(p)).toBe(true);
		});

		it('returns false when no endpoint is selected', () => {
			const p = makeMockProviders({
				navigation: {
					activePane: 'detail',
					activeView: 'request',
					isEditing: false,
					selectedEndpoint: null,
				},
			});
			expect(generateFieldCommand.isEnabled(p)).toBe(false);
		});
	});

	describe('execute', () => {
		it('generates value for a scalar parameter', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{
						name: 'petId',
						location: 'path',
						required: true,
						schema: { type: 'integer' },
					},
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateParamValue).toHaveBeenCalledWith(
				'petId',
				'mock-value',
			);
		});

		it('generates value for an array parameter in non-raw mode', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{
						name: 'tags',
						location: 'query',
						required: false,
						schema: { type: 'array', items: { type: 'string' } },
					},
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateParamArrayItem).toHaveBeenCalledWith(
				'tags',
				'mock-value',
			);
			expect(p.navigation.updateParamValue).not.toHaveBeenCalled();
		});

		it('generates value for an array parameter in raw mode (appends comma-separated)', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{
						name: 'tags',
						location: 'query',
						required: false,
						schema: { type: 'array', items: { type: 'string' } },
					},
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: { tags: true },
					paramValues: { tags: 'existing' },
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateParamValue).toHaveBeenCalledWith(
				'tags',
				'existing, mock-value',
			);
		});

		it('generates value for an array parameter in raw mode with empty existing value', () => {
			const endpoint = makeEndpoint({
				parameters: [
					{
						name: 'tags',
						location: 'query',
						required: false,
						schema: { type: 'array', items: { type: 'string' } },
					},
				],
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: { tags: true },
					paramValues: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateParamValue).toHaveBeenCalledWith(
				'tags',
				'mock-value',
			);
		});

		it('generates value for a body form field (non-array body)', () => {
			const endpoint = makeEndpoint({
				parameters: [],
				requestBody: {
					type: 'object',
					properties: {
						username: { type: 'string' },
					},
				},
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0, // first body field (0 params, so idx 0 = first body field)
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateBodyFieldValue).toHaveBeenCalledWith(
				'username',
				'mock-value',
			);
		});

		it('generates value for a body form field in an array body', () => {
			const endpoint = makeEndpoint({
				parameters: [],
				requestBody: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							itemName: { type: 'string' },
						},
					},
				},
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateBodyArrayItemField).toHaveBeenCalledWith(
				'itemName',
				'mock-value',
			);
		});

		it('skips file-type body fields', () => {
			const endpoint = makeEndpoint({
				parameters: [],
				requestBody: {
					type: 'object',
					properties: {
						avatar: { type: 'string', format: 'binary' },
					},
				},
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateBodyFieldValue).not.toHaveBeenCalled();
			expect(p.navigation.updateBodyArrayItemField).not.toHaveBeenCalled();
		});

		it('generates full JSON body when bodyEditMode is json', () => {
			const endpoint = makeEndpoint({
				parameters: [],
				requestBody: {
					type: 'object',
					properties: {
						username: { type: 'string' },
					},
				},
			});
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: endpoint,
					selectedFieldIndex: 0,
					bodyEditMode: 'json',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.setBodyValue).toHaveBeenCalledWith(
				JSON.stringify({ key: 'generated' }, null, 2),
			);
		});

		it('does nothing when endpoint is null', () => {
			const p = makeMockProviders({
				navigation: {
					selectedEndpoint: null,
					selectedFieldIndex: 0,
					bodyEditMode: 'form',
					paramArrayRawMode: {},
				},
			});

			generateFieldCommand.execute(p);

			expect(p.navigation.updateParamValue).not.toHaveBeenCalled();
			expect(p.navigation.updateBodyFieldValue).not.toHaveBeenCalled();
			expect(p.navigation.setBodyValue).not.toHaveBeenCalled();
		});
	});
});
