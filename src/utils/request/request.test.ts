import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AxiosResponse } from 'axios';
import { buildUrl, executeRequest } from './index.js';
import type { RequestConfig } from '../../types/RequestConfig/index.js';

vi.mock('axios');

describe('request utility', () => {
	it('builds URL with path params', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/pets/{petId}',
			{ petId: '42' },
			{},
		);
		expect(url).toBe('https://api.example.com/pets/42');
	});

	it('builds URL with query params', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/pets',
			{},
			{ limit: '10', offset: '0' },
		);
		expect(url).toBe('https://api.example.com/pets?limit=10&offset=0');
	});

	it('builds URL with both path and query params', () => {
		const url = buildUrl(
			'https://api.example.com',
			'/users/{userId}/posts',
			{ userId: '5' },
			{ page: '2' },
		);
		expect(url).toBe('https://api.example.com/users/5/posts?page=2');
	});
});

describe('executeRequest', () => {
	const baseUrl = 'https://api.example.com';

	function makeConfig(overrides?: Partial<RequestConfig>): RequestConfig {
		return {
			method: 'get',
			url: '/test',
			headers: {},
			queryParams: {},
			pathParams: {},
			...overrides,
		};
	}

	function mockAxiosResponse(
		data: ArrayBuffer | Buffer,
		headers: Record<string, string> = {},
		status = 200,
		statusText = 'OK',
	): AxiosResponse {
		return {
			data,
			status,
			statusText,
			headers,
			config: {} as AxiosResponse['config'],
		} as AxiosResponse;
	}

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('parses body as JSON when content-type contains json', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		const payload = { message: 'hello', count: 42 };
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(
				Buffer.from(JSON.stringify(payload)),
				{ 'content-type': 'application/json; charset=utf-8' },
			),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(result.status).toBe(200);
		expect(result.body).toEqual(payload);
	});

	it('falls back to raw text when JSON parsing fails', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		const badJson = '{ not valid json !!!';
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(
				Buffer.from(badJson),
				{ 'content-type': 'application/json' },
			),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(result.status).toBe(200);
		expect(result.body).toBe(badJson);
	});

	it.each([
		'application/octet-stream',
		'image/png',
		'audio/mpeg',
	])('returns body as Buffer for binary content-type %s', async (ct) => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(bytes, { 'content-type': ct }),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(Buffer.isBuffer(result.body)).toBe(true);
		expect(result.body).toEqual(bytes);
	});

	it.each([
		'text/plain',
		'text/html',
	])('returns body as string for text content-type %s', async (ct) => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		const text = '<h1>Hello World</h1>';
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(Buffer.from(text), { 'content-type': ct }),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(typeof result.body).toBe('string');
		expect(result.body).toBe(text);
	});

	it('includes rawBuffer as a Buffer on successful responses', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		const payload = { ok: true };
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(
				Buffer.from(JSON.stringify(payload)),
				{ 'content-type': 'application/json' },
			),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(result.rawBuffer).toBeDefined();
		expect(Buffer.isBuffer(result.rawBuffer)).toBe(true);
		expect(result.rawBuffer!.toString('utf-8')).toBe(
			JSON.stringify(payload),
		);
	});

	it('returns status 0 and error message when axios throws', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		mocked.mockRejectedValueOnce(new Error('Network Error'));

		const result = await executeRequest(baseUrl, makeConfig());

		expect(result.status).toBe(0);
		expect(result.statusText).toBe('Network Error');
		expect(result.body).toBeNull();
		expect(result.headers).toEqual({});
		expect(result.rawBuffer).toBeUndefined();
	});

	it('duration is a non-negative integer', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(Buffer.from('ok'), { 'content-type': 'text/plain' }),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(Number.isInteger(result.duration)).toBe(true);
		expect(result.duration).toBeGreaterThanOrEqual(0);
	});

	it('timestamp is a valid ISO 8601 string', async () => {
		const { default: axios } = await import('axios');
		const mocked = vi.mocked(axios);
		mocked.mockResolvedValueOnce(
			mockAxiosResponse(Buffer.from('{}'), { 'content-type': 'application/json' }),
		);

		const result = await executeRequest(baseUrl, makeConfig());

		expect(typeof result.timestamp).toBe('string');
		const parsed = new Date(result.timestamp);
		expect(parsed.toISOString()).toBe(result.timestamp);
	});
});
