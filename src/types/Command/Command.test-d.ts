import { describe, expectTypeOf, it } from 'vitest';
import type { CommandProviders } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import type { Command } from './index.js';

describe('Command types', () => {
	it('Command has required string id', () => {
		expectTypeOf<Command['id']>().toBeString();
	});

	it('Command has keys array', () => {
		expectTypeOf<Command['keys']>().toBeArray();
	});

	it('isEnabled is a function returning boolean', () => {
		expectTypeOf<Command['isEnabled']>().toEqualTypeOf<
			(p: CommandProviders) => boolean
		>();
	});

	it('execute is a function returning void', () => {
		expectTypeOf<Command['execute']>().toEqualTypeOf<
			(p: CommandProviders) => void
		>();
	});

	it('footer is optional and has specific literal values', () => {
		expectTypeOf<Command['footer']>().toEqualTypeOf<
			'priority' | 'optional' | 'hidden' | undefined
		>();
	});
});
