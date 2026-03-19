import { describe, expect, it, vi } from 'vitest';
import { COMMANDS } from '../../providers/CommandsProvider/index.js';

const quitCommand = COMMANDS.find((c) => c.id === 'QUIT');

describe('quitCommand (toolkit-provided)', () => {
	it('exists in the COMMANDS array', () => {
		expect(quitCommand).toBeDefined();
	});

	it('is enabled when no overlay is active', () => {
		expect(quitCommand).toBeDefined();
		if (!quitCommand) return;
		const deps = {
			ui: { activeOverlay: 'none' },
		} as Parameters<typeof quitCommand.isEnabled>[0];
		expect(quitCommand.isEnabled(deps)).toBe(true);
	});

	it('is disabled when an overlay is active', () => {
		expect(quitCommand).toBeDefined();
		if (!quitCommand) return;
		const deps = {
			ui: { activeOverlay: 'help' },
		} as Parameters<typeof quitCommand.isEnabled>[0];
		expect(quitCommand.isEnabled(deps)).toBe(false);
	});

	it('calls onQuit on execute', () => {
		expect(quitCommand).toBeDefined();
		if (!quitCommand) return;
		const onQuit = vi.fn();
		const deps = { onQuit } as unknown as Parameters<
			typeof quitCommand.execute
		>[0];
		quitCommand.execute(deps);
		expect(onQuit).toHaveBeenCalled();
	});

	it('needs confirmation', () => {
		expect(quitCommand).toBeDefined();
		if (!quitCommand) return;
		const deps = {} as Parameters<typeof quitCommand.isEnabled>[0];
		expect(quitCommand.needsConfirmation?.(deps)).toBe(true);
	});

	it('has correct metadata', () => {
		expect(quitCommand).toBeDefined();
		if (!quitCommand) return;
		expect(quitCommand.id).toBe('QUIT');
		expect(quitCommand.footer).toBe('priority');
		expect(quitCommand.helpSection).toBe('General');
		expect(quitCommand.confirmMessage).toBe('Quit?');
	});
});
