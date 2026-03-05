import { describe, expect, it } from 'vitest';
import type { AuthConfig } from '../../types/AuthConfig/index.js';
import type { EndpointParameter } from '../../types/Endpoint/index.js';
import { buildRequestHeaders, resolveAuthHeaders } from './index.js';

describe('resolveAuthHeaders', () => {
	it('returns empty for type none', () => {
		expect(resolveAuthHeaders({ type: 'none' })).toEqual({});
	});

	it('returns Bearer header', () => {
		const config: AuthConfig = {
			type: 'bearer',
			bearer: { token: 'abc123' },
		};
		expect(resolveAuthHeaders(config)).toEqual({
			Authorization: 'Bearer abc123',
		});
	});

	it('returns Basic header', () => {
		const config: AuthConfig = {
			type: 'basic',
			basic: { username: 'user', password: 'pass' },
		};
		const headers = resolveAuthHeaders(config);
		expect(headers.Authorization).toMatch(/^Basic /);
		const decoded = Buffer.from(
			headers.Authorization.replace('Basic ', ''),
			'base64',
		).toString();
		expect(decoded).toBe('user:pass');
	});

	it('returns API key header', () => {
		const config: AuthConfig = {
			type: 'apiKey',
			apiKey: { name: 'X-API-Key', value: 'secret', location: 'header' },
		};
		expect(resolveAuthHeaders(config)).toEqual({ 'X-API-Key': 'secret' });
	});

	it('returns empty for apiKey in query location', () => {
		const config: AuthConfig = {
			type: 'apiKey',
			apiKey: { name: 'key', value: 'secret', location: 'query' },
		};
		expect(resolveAuthHeaders(config)).toEqual({});
	});
});

describe('buildRequestHeaders', () => {
	const headerParam: EndpointParameter = {
		name: 'X-Request-Id',
		location: 'header',
		required: false,
		schema: { type: 'string' },
	};

	it('merges spec header params, global headers, and auth', () => {
		const result = buildRequestHeaders(
			{ 'X-Request-Id': 'req-1' },
			[headerParam],
			{ 'X-Custom': 'val' },
			{ type: 'bearer', bearer: { token: 'tok' } },
		);
		expect(result).toEqual({
			'X-Request-Id': 'req-1',
			'X-Custom': 'val',
			Authorization: 'Bearer tok',
		});
	});

	it('auth headers win over global headers on conflict', () => {
		const result = buildRequestHeaders(
			{},
			[],
			{ Authorization: 'old' },
			{ type: 'bearer', bearer: { token: 'new' } },
		);
		expect(result.Authorization).toBe('Bearer new');
	});

	it('skips empty param values', () => {
		const result = buildRequestHeaders(
			{ 'X-Request-Id': '' },
			[headerParam],
			{},
			{ type: 'none' },
		);
		expect(result).toEqual({});
	});
});
