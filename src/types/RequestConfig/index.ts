import type { HttpMethod } from '../Endpoint/index.js';

export type RequestConfig = {
	method: HttpMethod;
	url: string;
	headers: Record<string, string>;
	queryParams: Record<string, string | string[]>;
	pathParams: Record<string, string>;
	body?: unknown;
};
