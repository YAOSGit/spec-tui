import { describe, expect, it, vi } from 'vitest';
import type { CommandProviders } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import {
	closeConfigCommand,
	navigateConfigCommand,
	openConfigCommand,
	switchConfigSectionCommand,
} from './index.js';

function makeMockProviders(
	overrides: {
		navigation?: Partial<CommandProviders['navigation']>;
		ui?: Partial<CommandProviders['ui']>;
	} = {},
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
			...overrides.ui,
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

describe('navigateConfigCommand', () => {
	it('is enabled when activePane is config', () => {
		const p = makeMockProviders({ navigation: { activePane: 'config' } });
		expect(navigateConfigCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when activePane is not config', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator' },
		});
		expect(navigateConfigCommand.isEnabled(p)).toBe(false);
	});
});

describe('switchConfigSectionCommand', () => {
	it('is enabled when activePane is config', () => {
		const p = makeMockProviders({ navigation: { activePane: 'config' } });
		expect(switchConfigSectionCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when activePane is detail', () => {
		const p = makeMockProviders({ navigation: { activePane: 'detail' } });
		expect(switchConfigSectionCommand.isEnabled(p)).toBe(false);
	});
});

describe('closeConfigCommand', () => {
	it('is enabled when activePane is config', () => {
		const p = makeMockProviders({ navigation: { activePane: 'config' } });
		expect(closeConfigCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when activePane is navigator', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator' },
		});
		expect(closeConfigCommand.isEnabled(p)).toBe(false);
	});
});

describe('openConfigCommand', () => {
	it('is enabled when not showing help and not in config pane', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator' },
			ui: { showHelp: false },
		});
		expect(openConfigCommand.isEnabled(p)).toBe(true);
	});

	it('is disabled when already in config pane', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'config' },
			ui: { showHelp: false },
		});
		expect(openConfigCommand.isEnabled(p)).toBe(false);
	});

	it('is disabled when showing help', () => {
		const p = makeMockProviders({
			navigation: { activePane: 'navigator' },
			ui: { showHelp: true },
		});
		expect(openConfigCommand.isEnabled(p)).toBe(false);
	});

	it('execute sets activePane to config', () => {
		const p = makeMockProviders();
		openConfigCommand.execute(p);
		expect(p.navigation.setActivePane).toHaveBeenCalledWith('config');
	});
});
