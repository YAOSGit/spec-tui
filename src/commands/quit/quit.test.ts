import { describe, expect, it, vi } from 'vitest';
import { quitCommand } from './index.js';

describe('quitCommand', () => {
	it('is always enabled', () => {
		const p = {} as Parameters<typeof quitCommand.isEnabled>[0];
		expect(quitCommand.isEnabled(p)).toBe(true);
	});

	it('execute calls quit', () => {
		const p = { quit: vi.fn() } as unknown as Parameters<
			typeof quitCommand.execute
		>[0];
		quitCommand.execute(p);
		expect(p.quit).toHaveBeenCalled();
	});

	it('has correct metadata', () => {
		expect(quitCommand.id).toBe('QUIT');
		expect(quitCommand.footer).toBe('priority');
		expect(quitCommand.helpSection).toBe('General');
	});
});
