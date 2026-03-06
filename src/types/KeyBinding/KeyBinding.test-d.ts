import { describe, expectTypeOf, it } from 'vitest';
import type { KeyBinding } from './index.js';

describe('KeyBinding types', () => {
	it('textKey is optional string', () => {
		expectTypeOf<KeyBinding['textKey']>().toEqualTypeOf<string | undefined>();
	});

	it('specialKey is optional string', () => {
		expectTypeOf<KeyBinding['specialKey']>().toEqualTypeOf<
			string | undefined
		>();
	});

	it('ctrl is optional boolean', () => {
		expectTypeOf<KeyBinding['ctrl']>().toEqualTypeOf<boolean | undefined>();
	});

	it('accepts a textKey-only binding', () => {
		expectTypeOf({ textKey: 'q' }).toMatchTypeOf<KeyBinding>();
	});

	it('accepts a specialKey-only binding', () => {
		expectTypeOf({ specialKey: 'up' }).toMatchTypeOf<KeyBinding>();
	});
});
