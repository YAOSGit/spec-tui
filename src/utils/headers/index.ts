import type { AuthConfig } from '../../types/AuthConfig/index.js';
import type { EndpointParameter } from '../../types/Endpoint/index.js';

export function resolveAuthHeaders(
	config: AuthConfig,
): Record<string, string> {
	switch (config.type) {
		case 'bearer':
			if (config.bearer?.token) {
				return { Authorization: `Bearer ${config.bearer.token}` };
			}
			return {};
		case 'basic':
			if (config.basic?.username !== undefined) {
				const encoded = Buffer.from(
					`${config.basic.username}:${config.basic.password ?? ''}`,
				).toString('base64');
				return { Authorization: `Basic ${encoded}` };
			}
			return {};
		case 'apiKey':
			if (config.apiKey?.location === 'header' && config.apiKey.name) {
				return { [config.apiKey.name]: config.apiKey.value };
			}
			return {};
		default:
			return {};
	}
}

export function buildRequestHeaders(
	paramValues: Record<string, string>,
	endpointParams: EndpointParameter[],
	globalHeaders: Record<string, string>,
	authConfig: AuthConfig,
): Record<string, string> {
	const headers: Record<string, string> = {};

	for (const param of endpointParams) {
		if (param.location === 'header' && paramValues[param.name]) {
			headers[param.name] = paramValues[param.name];
		}
	}

	Object.assign(headers, globalHeaders);
	Object.assign(headers, resolveAuthHeaders(authConfig));

	return headers;
}
