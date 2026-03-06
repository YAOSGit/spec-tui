import { describe, expect, it } from 'vitest';
import {
	extractBodySchemaFields,
	hasFileFields,
	isMultipartEndpoint,
} from '../src/utils/bodySchema/index.js';
import {
	detectContentFormat,
	formatBadgeColor,
	formatBadgeLabel,
} from '../src/utils/contentType/index.js';
import {
	buildRequestHeaders,
	resolveAuthHeaders,
} from '../src/utils/headers/index.js';
import { buildUrl } from '../src/utils/request/index.js';

describe('Request URL building E2E', () => {
	it('builds a simple URL with no params', () => {
		const url = buildUrl('https://api.example.com', '/pets', {}, {});
		expect(url).toBe('https://api.example.com/pets');
	});

	it('substitutes path parameters', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/pets/{petId}',
			{ petId: '42' },
			{},
		);
		expect(url).toBe('https://api.example.com/pets/42');
	});

	it('appends query parameters', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/pets',
			{},
			{ limit: '10' },
		);
		expect(url).toContain('limit=10');
	});

	it('handles both path and query parameters', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/users/{userId}/posts',
			{ userId: '5' },
			{ page: '2' },
		);
		expect(url).toContain('/users/5/posts');
		expect(url).toContain('page=2');
	});

	it('encodes path parameter values', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/items/{name}',
			{ name: 'hello world' },
			{},
		);
		expect(url).toContain('hello%20world');
	});

	it('handles array query parameters', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/search',
			{},
			{ tags: ['cat', 'dog'] },
		);
		expect(url).toContain('tags=cat');
		expect(url).toContain('tags=dog');
	});

	it('preserves base URL path prefix', () => {
		const url = buildUrl('https://api.example.com/api/v3', '/pets', {}, {});
		expect(url).toContain('/api/v3/pets');
	});

	it('handles multiple path parameters', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/orgs/{orgId}/repos/{repoId}',
			{ orgId: 'acme', repoId: '123' },
			{},
		);
		expect(url).toContain('/orgs/acme/repos/123');
	});
});

describe('Content type detection E2E', () => {
	it('detects JSON content type', () => {
		expect(detectContentFormat('application/json')).toBe('json');
	});

	it('detects JSON with charset', () => {
		expect(detectContentFormat('application/json; charset=utf-8')).toBe('json');
	});

	it('detects HTML content type', () => {
		expect(detectContentFormat('text/html')).toBe('html');
	});

	it('detects XML content type', () => {
		expect(detectContentFormat('text/xml')).toBe('xml');
	});

	it('detects binary content type for images', () => {
		expect(detectContentFormat('image/png')).toBe('binary');
	});

	it('falls back to text for unknown content type', () => {
		expect(detectContentFormat('application/x-custom')).toBe('text');
	});

	it('sniffs JSON from body when header is absent', () => {
		expect(detectContentFormat(undefined, '{"key": "value"}')).toBe('json');
	});

	it('sniffs HTML from body when header is absent', () => {
		expect(
			detectContentFormat(
				undefined,
				'<!DOCTYPE html><html><body></body></html>',
			),
		).toBe('html');
	});

	it('returns correct badge labels', () => {
		expect(formatBadgeLabel('json')).toBe('JSON');
		expect(formatBadgeLabel('binary')).toBe('BIN');
		expect(formatBadgeLabel('text')).toBe('TXT');
	});

	it('returns correct badge colors', () => {
		expect(formatBadgeColor('json')).toBe('green');
		expect(formatBadgeColor('binary')).toBe('red');
	});
});

describe('Body schema handling E2E', () => {
	it('extracts fields from an object schema', () => {
		const schema = {
			type: 'object',
			required: ['name'],
			properties: {
				id: { type: 'integer' },
				name: { type: 'string' },
				tag: { type: 'string' },
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields).toHaveLength(3);
		const nameField = fields.find((f) => f.name === 'name');
		expect(nameField?.required).toBe(true);
		const tagField = fields.find((f) => f.name === 'tag');
		expect(tagField?.required).toBe(false);
	});

	it('returns empty array for schema with no properties', () => {
		const fields = extractBodySchemaFields({ type: 'object' });
		expect(fields).toEqual([]);
	});

	it('detects file fields in schema', () => {
		const fields = extractBodySchemaFields({
			type: 'object',
			properties: {
				file: { type: 'string', format: 'binary' },
				description: { type: 'string' },
			},
		});
		expect(hasFileFields(fields)).toBe(true);
	});

	it('detects multipart endpoint from content types', () => {
		const endpoint = {
			contentTypes: {
				requestContentTypes: ['multipart/form-data'],
			},
		};
		expect(isMultipartEndpoint(endpoint)).toBe(true);
	});

	it('does not flag non-multipart endpoint', () => {
		const endpoint = {
			contentTypes: {
				requestContentTypes: ['application/json'],
			},
		};
		expect(isMultipartEndpoint(endpoint)).toBe(false);
	});
});

describe('Auth headers E2E', () => {
	it('resolves bearer token header', () => {
		const headers = resolveAuthHeaders({
			type: 'bearer',
			bearer: { token: 'my-token' },
		});
		expect(headers.Authorization).toBe('Bearer my-token');
	});

	it('resolves basic auth header', () => {
		const headers = resolveAuthHeaders({
			type: 'basic',
			basic: { username: 'user', password: 'pass' },
		});
		const expected = `Basic ${Buffer.from('user:pass').toString('base64')}`;
		expect(headers.Authorization).toBe(expected);
	});

	it('resolves API key header', () => {
		const headers = resolveAuthHeaders({
			type: 'apiKey',
			apiKey: { name: 'X-API-Key', value: 'secret', location: 'header' },
		});
		expect(headers['X-API-Key']).toBe('secret');
	});

	it('returns empty for no auth', () => {
		const headers = resolveAuthHeaders({ type: 'none' });
		expect(Object.keys(headers)).toHaveLength(0);
	});

	it('builds request headers with global headers and auth', () => {
		const headers = buildRequestHeaders(
			{ 'X-Custom': 'value' },
			[
				{
					name: 'X-Custom',
					location: 'header',
					required: false,
					schema: {},
				},
			],
			{ Accept: 'application/json' },
			{ type: 'bearer', bearer: { token: 'tok' } },
		);
		expect(headers['X-Custom']).toBe('value');
		expect(headers.Accept).toBe('application/json');
		expect(headers.Authorization).toBe('Bearer tok');
	});
});
