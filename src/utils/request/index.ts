import axios from 'axios';
import type { RequestConfig } from '../../types/RequestConfig/index.js';
import type { ResponseData } from '../../types/ResponseData/index.js';

export function buildUrl(
	baseUrl: string,
	pathTemplate: string,
	pathParams: Record<string, string>,
	queryParams: Record<string, string | string[]>,
): string {
	let resolvedPath = pathTemplate;
	for (const [key, value] of Object.entries(pathParams)) {
		resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(value));
	}

	// Concatenate baseUrl path with the endpoint path to preserve /api/v3 etc.
	const base = new URL(baseUrl);
	const basePath = base.pathname.replace(/\/+$/, '');
	base.pathname = basePath + resolvedPath;
	const url = base;
	for (const [key, value] of Object.entries(queryParams)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				url.searchParams.append(key, v);
			}
		} else {
			url.searchParams.set(key, value);
		}
	}

	return url.toString();
}

export async function executeRequest(
	baseUrl: string,
	config: RequestConfig,
): Promise<ResponseData> {
	const url = buildUrl(
		baseUrl,
		config.url,
		config.pathParams,
		config.queryParams,
	);
	const start = performance.now();

	try {
		const response = await axios({
			method: config.method,
			url,
			headers: config.headers,
			data: config.body,
			responseType: 'arraybuffer',
			validateStatus: () => true,
		});

		const duration = Math.round(performance.now() - start);
		const rawBuffer = Buffer.from(response.data as ArrayBuffer);
		const contentType =
			(response.headers['content-type'] as string | undefined) ?? '';
		const isBinary = /octet-stream|image\/|audio\/|video\//.test(contentType);

		let body: unknown;
		if (isBinary) {
			body = rawBuffer;
		} else {
			const text = rawBuffer.toString('utf-8');
			if (/\bjson\b/.test(contentType)) {
				try {
					body = JSON.parse(text);
				} catch {
					body = text;
				}
			} else {
				body = text;
			}
		}

		return {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers as Record<string, string>,
			body,
			rawBuffer,
			duration,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		const duration = Math.round(performance.now() - start);
		const message = error instanceof Error ? error.message : String(error);

		return {
			status: 0,
			statusText: message,
			headers: {},
			body: null,
			duration,
			timestamp: new Date().toISOString(),
		};
	}
}
