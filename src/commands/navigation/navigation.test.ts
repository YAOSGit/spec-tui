import { describe, expect, it, vi } from 'vitest';
import type { CommandProviders } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';
import { navigateDownCommand, navigateUpCommand } from './index.js';

function makeEndpoint(): Endpoint {
	return {
		method: 'get',
		path: '/test',
		summary: 'Test',
		tags: [],
		parameters: [],
		responses: {},
		deprecated: false,
		contentTypes: { requestContentTypes: [], responseContentTypes: {} },
	};
}

function makeMockProviders(
	overrides: Partial<{
		navigation: Partial<CommandProviders['navigation']>;
		spec: Partial<CommandProviders['spec']>;
	}> = {},
): CommandProviders {
	return {
		navigation: {
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
		},
		spec: {
			endpoints: [],
			specTitle: 'Test',
			baseUrl: 'http://localhost',
			securitySchemes: [],
			loading: false,
			error: null,
			...overrides.spec,
		},
		ui: {
			showHelp: false,
			showFakerPicker: false,
			saveMode: false,
			setSaveMode: vi.fn(),
			openHelp: vi.fn(),
			closeHelp: vi.fn(),
			toggleHelp: vi.fn(),
			openFakerPicker: vi.fn(),
			closeFakerPicker: vi.fn(),
		},
		requestConfig: {
			globalHeaders: {},
			setGlobalHeaders: vi.fn(),
			addHeader: vi.fn(),
			removeHeader: vi.fn(),
			updateHeader: vi.fn(),
			authConfig: { type: 'none' },
			setAuthConfig: vi.fn(),
		},
		quit: vi.fn(),
	};
}

describe('navigateUpCommand', () => {
	it('is enabled when activePane is navigator', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator' },
		});
		expect(navigateUpCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when activePane is detail', () => {
		const p = makeMockProviders({ navigation: { activePane: 'detail' } });
		expect(navigateUpCommand.isEnabled(p)).toBe(false);
	});

	it('decrements selectedIndex when > 0', () => {
		const p = makeMockProviders({
			navigation: { selectedIndex: 2 },
		});
		navigateUpCommand.execute(p);
		expect(p.navigation.setSelectedIndex).toHaveBeenCalledWith(1);
	});

	it('does not decrement below 0', () => {
		const p = makeMockProviders({
			navigation: { selectedIndex: 0 },
		});
		navigateUpCommand.execute(p);
		expect(p.navigation.setSelectedIndex).not.toHaveBeenCalled();
	});
});

describe('navigateDownCommand', () => {
	it('is enabled when activePane is navigator and not at last endpoint', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator', selectedIndex: 0 },
			spec: { endpoints: [makeEndpoint(), makeEndpoint()] },
		});
		expect(navigateDownCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when at last endpoint', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator', selectedIndex: 1 },
			spec: { endpoints: [makeEndpoint(), makeEndpoint()] },
		});
		expect(navigateDownCommand.isEnabled(p)).toBe(false);
	});

	it('increments selectedIndex', () => {
		const p = makeMockProviders({
			navigation: { selectedIndex: 0 },
			spec: { endpoints: [makeEndpoint(), makeEndpoint()] },
		});
		navigateDownCommand.execute(p);
		expect(p.navigation.setSelectedIndex).toHaveBeenCalledWith(1);
	});
});
