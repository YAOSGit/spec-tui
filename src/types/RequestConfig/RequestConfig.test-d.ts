import { assertType, describe, it } from 'vitest';
import type { RequestConfig } from './index.js';

describe('RequestConfig type', () => {
	it('accepts a valid request config', () => {
		assertType<RequestConfig>({
			method: 'post',
			url: 'https://api.example.com/pets',
			headers: { Authorization: 'Bearer token' },
			queryParams: {},
			pathParams: {},
			body: { name: 'Rex' },
		});
	});
});
