import { assertType, describe, it } from 'vitest';
import type { SentRequest } from './index.js';

describe('SentRequest type', () => {
	it('accepts a valid sent request', () => {
		assertType<SentRequest>({
			method: 'GET',
			url: 'https://api.example.com/pets',
			headers: { 'content-type': 'application/json' },
		});
	});

	it('accepts a sent request with a body', () => {
		assertType<SentRequest>({
			method: 'POST',
			url: 'https://api.example.com/pets',
			headers: { 'content-type': 'application/json' },
			body: { name: 'Rex' },
		});
	});
});
