import { assertType, describe, it } from 'vitest';
import type { HistoryEntry, ResponseData } from './index.js';

describe('ResponseData type', () => {
	it('accepts a valid response', () => {
		assertType<ResponseData>({
			status: 200,
			statusText: 'OK',
			headers: { 'content-type': 'application/json' },
			body: [{ id: 1, name: 'Rex' }],
			duration: 142,
			timestamp: '2026-01-01T00:00:00.000Z',
		});
	});

	it('accepts a valid history entry', () => {
		assertType<HistoryEntry>({
			id: 'abc-123',
			method: 'GET',
			url: '/pets',
			response: {
				status: 200,
				statusText: 'OK',
				headers: {},
				body: null,
				duration: 50,
				timestamp: '2026-01-01T00:00:00.000Z',
			},
		});
	});
});
