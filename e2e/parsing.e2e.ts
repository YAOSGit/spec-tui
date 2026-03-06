import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSpec } from '../src/parser/openapi/index.js';

const PETSTORE_YAML = path.resolve(
	__dirname,
	'../examples/basic/petstore.yaml',
);
const PETSTORE_JSON = path.resolve(__dirname, 'fixtures/petstore.json');
const MALFORMED_YAML = path.resolve(__dirname, 'fixtures/malformed.yaml');
const EMPTY_YAML = path.resolve(__dirname, 'fixtures/empty.yaml');
const NOT_OPENAPI = path.resolve(__dirname, 'fixtures/not-openapi.yaml');

describe('Spec parsing E2E', () => {
	it('parses a valid YAML spec and returns endpoints', async () => {
		const result = await parseSpec(PETSTORE_YAML);
		expect(result.endpoints.length).toBeGreaterThan(0);
	});

	it('parses a valid JSON spec and returns endpoints', async () => {
		const result = await parseSpec(PETSTORE_JSON);
		expect(result.endpoints.length).toBeGreaterThan(0);
	});

	it('extracts baseUrl from JSON spec servers array', async () => {
		const result = await parseSpec(PETSTORE_JSON);
		expect(result.baseUrl).toBe('https://petstore.example.com/api/v1');
	});

	it('extracts security schemes when present', async () => {
		const result = await parseSpec(PETSTORE_YAML);
		expect(Array.isArray(result.securitySchemes)).toBe(true);
	});

	it('throws on malformed YAML', async () => {
		await expect(parseSpec(MALFORMED_YAML)).rejects.toThrow();
	});

	it('throws on empty file', async () => {
		await expect(parseSpec(EMPTY_YAML)).rejects.toThrow();
	});

	it('throws on non-OpenAPI YAML', async () => {
		await expect(parseSpec(NOT_OPENAPI)).rejects.toThrow();
	});

	it('throws on nonexistent file', async () => {
		await expect(parseSpec('/tmp/does-not-exist-spec.yaml')).rejects.toThrow();
	});
});
