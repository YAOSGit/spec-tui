import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ParsedSpec } from '../src/parser/openapi/index.js';
import { parseSpec } from '../src/parser/openapi/index.js';

const PETSTORE_YAML = path.resolve(
	__dirname,
	'../examples/basic/petstore.yaml',
);
const PETSTORE_JSON = path.resolve(__dirname, 'fixtures/petstore.json');
const MULTIPART_SPEC = path.resolve(__dirname, 'fixtures/multipart-spec.yaml');

describe('Endpoint extraction E2E', () => {
	let yamlSpec: ParsedSpec;
	let jsonSpec: ParsedSpec;

	beforeAll(async () => {
		yamlSpec = await parseSpec(PETSTORE_YAML);
		jsonSpec = await parseSpec(PETSTORE_JSON);
	});

	describe('YAML petstore', () => {
		it('extracts the correct number of endpoints', () => {
			expect(yamlSpec.endpoints).toHaveLength(3);
		});

		it('extracts GET /pets endpoint', () => {
			const ep = yamlSpec.endpoints.find(
				(e) => e.method === 'get' && e.path === '/pets',
			);
			expect(ep).toBeDefined();
			expect(ep?.operationId).toBe('listPets');
			expect(ep?.summary).toBe('List all pets');
		});

		it('extracts POST /pets endpoint', () => {
			const ep = yamlSpec.endpoints.find(
				(e) => e.method === 'post' && e.path === '/pets',
			);
			expect(ep).toBeDefined();
			expect(ep?.operationId).toBe('createPet');
		});

		it('extracts GET /pets/{petId} endpoint', () => {
			const ep = yamlSpec.endpoints.find(
				(e) => e.method === 'get' && e.path === '/pets/{petId}',
			);
			expect(ep).toBeDefined();
			expect(ep?.operationId).toBe('showPetById');
		});

		it('extracts tags correctly', () => {
			for (const ep of yamlSpec.endpoints) {
				expect(ep.tags).toContain('pets');
			}
		});

		it('extracts query parameters from GET /pets', () => {
			const ep = yamlSpec.endpoints.find(
				(e) => e.method === 'get' && e.path === '/pets',
			);
			expect(ep?.parameters).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: 'limit',
						location: 'query',
					}),
				]),
			);
		});

		it('extracts path parameters from GET /pets/{petId}', () => {
			const ep = yamlSpec.endpoints.find(
				(e) => e.method === 'get' && e.path === '/pets/{petId}',
			);
			expect(ep?.parameters).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: 'petId',
						location: 'path',
						required: true,
					}),
				]),
			);
		});

		it('marks no endpoints as deprecated', () => {
			for (const ep of yamlSpec.endpoints) {
				expect(ep.deprecated).toBe(false);
			}
		});
	});

	describe('JSON petstore', () => {
		it('extracts endpoints from JSON spec', () => {
			expect(jsonSpec.endpoints.length).toBeGreaterThan(0);
		});

		it('extracts the correct number of endpoints', () => {
			expect(jsonSpec.endpoints).toHaveLength(4);
		});

		it('includes DELETE method from JSON spec', () => {
			const ep = jsonSpec.endpoints.find(
				(e) => e.method === 'delete' && e.path === '/pets/{petId}',
			);
			expect(ep).toBeDefined();
			expect(ep?.operationId).toBe('deletePet');
		});

		it('extracts baseUrl from servers array', () => {
			expect(jsonSpec.baseUrl).toBe('https://petstore.example.com/api/v1');
		});
	});

	describe('multipart spec', () => {
		let multipartSpec: ParsedSpec;

		beforeAll(async () => {
			multipartSpec = await parseSpec(MULTIPART_SPEC);
		});

		it('extracts endpoints from multipart spec', () => {
			expect(multipartSpec.endpoints.length).toBeGreaterThan(0);
		});

		it('extracts POST /upload with multipart content type', () => {
			const ep = multipartSpec.endpoints.find(
				(e) => e.method === 'post' && e.path === '/upload',
			);
			expect(ep).toBeDefined();
			expect(ep?.contentTypes.requestContentTypes).toContain(
				'multipart/form-data',
			);
		});

		it('extracts query parameters with enum values', () => {
			const ep = multipartSpec.endpoints.find(
				(e) => e.method === 'get' && e.path === '/items',
			);
			const statusParam = ep?.parameters.find((p) => p.name === 'status');
			expect(statusParam).toBeDefined();
			expect(statusParam?.schema.enum).toEqual([
				'active',
				'inactive',
				'pending',
			]);
		});

		it('extracts baseUrl from multipart spec servers', () => {
			expect(multipartSpec.baseUrl).toBe('https://upload.example.com');
		});
	});
});
