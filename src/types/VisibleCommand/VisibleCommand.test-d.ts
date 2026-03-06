import { describe, expectTypeOf, it } from 'vitest';
import type { VisibleCommand } from './index.js';

describe('VisibleCommand types', () => {
	it('has required displayKey', () => {
		expectTypeOf<VisibleCommand['displayKey']>().toBeString();
	});

	it('has required displayText', () => {
		expectTypeOf<VisibleCommand['displayText']>().toBeString();
	});

	it('priority is optional boolean', () => {
		expectTypeOf<VisibleCommand['priority']>().toEqualTypeOf<
			boolean | undefined
		>();
	});

	it('footerOrder is optional number', () => {
		expectTypeOf<VisibleCommand['footerOrder']>().toEqualTypeOf<
			number | undefined
		>();
	});
});
