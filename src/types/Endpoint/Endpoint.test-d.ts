import { assertType, describe, it } from 'vitest';
import type { Endpoint, HttpMethod, ParameterLocation } from './index.js';

describe('Endpoint type', () => {
	it('accepts a valid endpoint', () => {
		assertType<Endpoint>({
			method: 'get',
			path: '/pets',
			summary: 'List all pets',
			operationId: 'listPets',
			tags: ['pets'],
			parameters: [
				{
					name: 'limit',
					location: 'query',
					required: false,
					schema: { type: 'integer' },
				},
			],
			responses: { '200': { type: 'array' } },
			deprecated: false,
			contentTypes: { requestContentTypes: [], responseContentTypes: {} },
		});
	});

	it('restricts HTTP methods', () => {
		assertType<HttpMethod>('get');
		assertType<HttpMethod>('post');
		assertType<HttpMethod>('delete');
	});

	it('restricts parameter locations', () => {
		assertType<ParameterLocation>('path');
		assertType<ParameterLocation>('query');
		assertType<ParameterLocation>('header');
	});
});
