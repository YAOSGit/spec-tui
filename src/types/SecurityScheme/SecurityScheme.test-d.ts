import { describe, expectTypeOf, it } from 'vitest';
import type { SecurityScheme } from './index.js';

describe('SecurityScheme types', () => {
	it('has required id field', () => {
		expectTypeOf<SecurityScheme['id']>().toBeString();
	});

	it('type is a union of four literals', () => {
		expectTypeOf<SecurityScheme['type']>().toEqualTypeOf<
			'http' | 'apiKey' | 'oauth2' | 'openIdConnect'
		>();
	});

	it('in field restricts to header, query, or cookie', () => {
		expectTypeOf<SecurityScheme['in']>().toEqualTypeOf<
			'header' | 'query' | 'cookie' | undefined
		>();
	});

	it('scheme is optional', () => {
		expectTypeOf<SecurityScheme['scheme']>().toEqualTypeOf<
			string | undefined
		>();
	});
});
