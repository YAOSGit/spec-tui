import { describe, expectTypeOf, it } from 'vitest';
import type { AuthConfig, AuthType } from './index.js';
import { DEFAULT_AUTH_CONFIG } from './index.js';

describe('AuthConfig types', () => {
	it('AuthType is a union of four string literals', () => {
		expectTypeOf<AuthType>().toEqualTypeOf<
			'none' | 'bearer' | 'basic' | 'apiKey'
		>();
	});

	it('AuthConfig requires a type field', () => {
		expectTypeOf<AuthConfig>().toHaveProperty('type');
	});

	it('bearer field is optional', () => {
		expectTypeOf<AuthConfig['bearer']>().toEqualTypeOf<
			{ token: string } | undefined
		>();
	});

	it('basic field is optional', () => {
		expectTypeOf<AuthConfig['basic']>().toEqualTypeOf<
			{ username: string; password: string } | undefined
		>();
	});

	it('apiKey field is optional', () => {
		expectTypeOf<AuthConfig['apiKey']>().toEqualTypeOf<
			{ name: string; value: string; location: 'header' | 'query' } | undefined
		>();
	});

	it('DEFAULT_AUTH_CONFIG is a valid AuthConfig', () => {
		expectTypeOf(DEFAULT_AUTH_CONFIG).toMatchTypeOf<AuthConfig>();
	});
});
