import { describe, expect, it, vi } from 'vitest';
import { helpCommand } from './index.js';

describe('helpCommand', () => {
	it('is always enabled', () => {
		const p = {} as Parameters<typeof helpCommand.isEnabled>[0];
		expect(helpCommand.isEnabled(p)).toBe(true);
	});

	it('execute toggles help', () => {
		const p = {
			ui: { toggleHelp: vi.fn() },
		} as unknown as Parameters<typeof helpCommand.execute>[0];
		helpCommand.execute(p);
		expect(p.ui.toggleHelp).toHaveBeenCalled();
	});

	it('has correct metadata', () => {
		expect(helpCommand.id).toBe('HELP');
		expect(helpCommand.footer).toBe('priority');
		expect(helpCommand.helpSection).toBe('General');
	});
});
