import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import type { ParsedSpec } from '../src/parser/openapi/index.js';
import { parseSpec } from '../src/parser/openapi/index.js';
import {
	extractBodySchemaFields,
	serializeBodyArrayFields,
	serializeBodyFields,
} from '../src/utils/bodySchema/index.js';
import {
	generateArrayParamValue,
	generateObjectFromSchema,
	generateValue,
	guessCategory,
} from '../src/utils/faker/index.js';

const PETSTORE_YAML = path.resolve(
	__dirname,
	'../examples/basic/petstore.yaml',
);
const MULTIPART_SPEC = path.resolve(__dirname, 'fixtures/multipart-spec.yaml');

describe('Mock/Faker generation E2E', () => {
	let petstoreSpec: ParsedSpec;

	beforeAll(async () => {
		petstoreSpec = await parseSpec(PETSTORE_YAML);
	});

	describe('category guessing from real spec parameters', () => {
		it('guesses category for limit param', () => {
			const ep = petstoreSpec.endpoints.find(
				(e) => e.operationId === 'listPets',
			);
			const param = ep?.parameters.find((p) => p.name === 'limit');
			expect(param).toBeDefined();
			const cat = guessCategory(param?.name, param?.schema);
			expect(cat).toBe('number');
		});

		it('guesses category for petId param', () => {
			const ep = petstoreSpec.endpoints.find(
				(e) => e.operationId === 'showPetById',
			);
			const param = ep?.parameters.find((p) => p.name === 'petId');
			expect(param).toBeDefined();
			const cat = guessCategory(param?.name, param?.schema);
			expect(typeof cat).toBe('string');
			expect(cat.length).toBeGreaterThan(0);
		});
	});

	describe('value generation for real spec schemas', () => {
		it('generates a mock value for each parameter', () => {
			for (const ep of petstoreSpec.endpoints) {
				for (const param of ep.parameters) {
					const cat = guessCategory(param.name, param.schema);
					const val = generateValue(cat, param.schema);
					expect(typeof val).toBe('string');
					expect(val.length).toBeGreaterThan(0);
				}
			}
		});

		it('generates an object from the Pet request body schema', () => {
			const ep = petstoreSpec.endpoints.find(
				(e) => e.method === 'post' && e.path === '/pets',
			);
			expect(ep?.requestBody).toBeDefined();
			const obj = generateObjectFromSchema(
				ep?.requestBody as Record<string, unknown>,
			);
			expect(obj).toHaveProperty('id');
			expect(obj).toHaveProperty('name');
		});
	});

	describe('body field extraction and serialization', () => {
		it('extracts fields from Pet schema and serializes them', () => {
			const ep = petstoreSpec.endpoints.find(
				(e) => e.method === 'post' && e.path === '/pets',
			);
			const fields = extractBodySchemaFields(
				ep?.requestBody as Record<string, unknown>,
			);
			expect(fields.length).toBeGreaterThan(0);

			const values: Record<string, string> = {};
			for (const field of fields) {
				const cat = guessCategory(field.name, field.schema);
				values[field.name] = generateValue(cat, field.schema);
			}

			const json = serializeBodyFields(fields, values);
			const parsed = JSON.parse(json);
			expect(parsed).toHaveProperty('id');
			expect(parsed).toHaveProperty('name');
		});

		it('serializes array body fields', () => {
			const fields = [
				{
					name: 'name',
					type: 'string',
					required: true,
					schema: { type: 'string' },
				},
				{
					name: 'age',
					type: 'integer',
					required: false,
					schema: { type: 'integer' },
				},
			];
			const items = [
				{ name: 'Alice', age: '30' },
				{ name: 'Bob', age: '25' },
			];
			const json = serializeBodyArrayFields(fields, items);
			const parsed = JSON.parse(json);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed).toHaveLength(2);
		});
	});

	describe('enum parameter value generation', () => {
		it('generates values from enum schema', () => {
			const schema = {
				type: 'string',
				enum: ['active', 'inactive', 'pending'],
			};
			const val = generateValue('word', schema);
			expect(['active', 'inactive', 'pending']).toContain(val);
		});

		it('generates array values from enum items', () => {
			const result = generateArrayParamValue('statuses', {
				type: 'array',
				items: {
					type: 'string',
					enum: ['active', 'inactive', 'pending'],
				},
			});
			const parts = result.split(',');
			expect(parts.length).toBeGreaterThan(0);
			for (const part of parts) {
				expect(['active', 'inactive', 'pending']).toContain(part);
			}
		});
	});

	describe('multipart spec mock generation', () => {
		let multipartSpec: ParsedSpec;

		beforeAll(async () => {
			multipartSpec = await parseSpec(MULTIPART_SPEC);
		});

		it('extracts body fields from multipart upload endpoint', () => {
			const ep = multipartSpec.endpoints.find(
				(e) => e.operationId === 'uploadFile',
			);
			expect(ep?.requestBody).toBeDefined();
			const fields = extractBodySchemaFields(
				ep?.requestBody as Record<string, unknown>,
			);
			expect(fields.length).toBeGreaterThan(0);
		});

		it('generates mock values for items list parameters', () => {
			const ep = multipartSpec.endpoints.find(
				(e) => e.operationId === 'listItems',
			);
			expect(ep).toBeDefined();
			if (!ep) throw new Error('ep not found');
			for (const param of ep.parameters) {
				const cat = guessCategory(param.name, param.schema);
				const val = generateValue(cat, param.schema);
				expect(typeof val).toBe('string');
				expect(val.length).toBeGreaterThan(0);
			}
		});
	});
});
