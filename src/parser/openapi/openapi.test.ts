import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSpec } from './index.js';

const PETSTORE_PATH = path.resolve(
	__dirname,
	'../../../examples/basic/petstore.yaml',
);

describe('OpenAPI parser', () => {
	it('parses a valid OpenAPI spec and extracts endpoints', async () => {
		const { endpoints } = await parseSpec(PETSTORE_PATH);

		expect(endpoints.length).toBeGreaterThan(0);

		const listPets = endpoints.find((e) => e.operationId === 'listPets');
		expect(listPets).toBeDefined();
		expect(listPets?.method).toBe('get');
		expect(listPets?.path).toBe('/pets');
		expect(listPets?.tags).toContain('pets');
	});

	it('extracts parameters from endpoints', async () => {
		const { endpoints } = await parseSpec(PETSTORE_PATH);
		const showPet = endpoints.find((e) => e.operationId === 'showPetById');

		expect(showPet).toBeDefined();
		expect(showPet?.parameters).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'petId',
					location: 'path',
					required: true,
				}),
			]),
		);
	});

	it('extracts request body schema', async () => {
		const { endpoints } = await parseSpec(PETSTORE_PATH);
		const createPet = endpoints.find((e) => e.operationId === 'createPet');

		expect(createPet).toBeDefined();
		expect(createPet?.requestBody).toBeDefined();
	});

	it('marks deprecated endpoints', async () => {
		const { endpoints } = await parseSpec(PETSTORE_PATH);
		const nonDeprecated = endpoints.filter((e) => !e.deprecated);
		expect(nonDeprecated.length).toBe(endpoints.length);
	});

	it('extracts baseUrl from servers array', async () => {
		const { baseUrl } = await parseSpec(PETSTORE_PATH);
		expect(typeof baseUrl).toBe('string');
	});

	it('extracts securitySchemes from spec', async () => {
		const { securitySchemes } = await parseSpec(PETSTORE_PATH);
		expect(Array.isArray(securitySchemes)).toBe(true);
	});
});
