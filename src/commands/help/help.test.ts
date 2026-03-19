import { describe, expect, it, vi } from 'vitest';
import { COMMANDS } from '../../providers/CommandsProvider/index.js';

const helpCommand = COMMANDS.find((c) => c.id === 'HELP');

describe('helpCommand (toolkit-provided)', () => {
	it('exists in the COMMANDS array', () => {
		expect(helpCommand).toBeDefined();
	});

	it('is enabled when activeOverlay is none', () => {
		expect(helpCommand).toBeDefined();
		if (!helpCommand) return;
		const deps = {
			ui: { activeOverlay: 'none' },
		} as unknown as Parameters<typeof helpCommand.isEnabled>[0];
		expect(helpCommand.isEnabled(deps)).toBe(true);
	});

	it('is disabled when activeOverlay is not none', () => {
		expect(helpCommand).toBeDefined();
		if (!helpCommand) return;
		const deps = {
			ui: { activeOverlay: 'help' },
		} as unknown as Parameters<typeof helpCommand.isEnabled>[0];
		expect(helpCommand.isEnabled(deps)).toBe(false);
	});

	it('execute opens help overlay', () => {
		expect(helpCommand).toBeDefined();
		if (!helpCommand) return;
		const setActiveOverlay = vi.fn();
		const deps = {
			ui: { setActiveOverlay },
		} as unknown as Parameters<typeof helpCommand.execute>[0];
		helpCommand.execute(deps);
		expect(setActiveOverlay).toHaveBeenCalledWith('help');
	});

	it('has correct metadata', () => {
		expect(helpCommand).toBeDefined();
		if (!helpCommand) return;
		expect(helpCommand.id).toBe('HELP');
		expect(helpCommand.footer).toBe('priority');
		expect(helpCommand.helpSection).toBe('General');
	});
});
