import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';
import type {
	Endpoint,
	EndpointParameter,
	HttpMethod,
} from '../../types/Endpoint/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';

const HTTP_METHODS: HttpMethod[] = [
	'get',
	'post',
	'put',
	'patch',
	'delete',
	'options',
	'head',
];

export interface ParsedSpec {
	endpoints: Endpoint[];
	baseUrl: string;
	securitySchemes: SecurityScheme[];
}

export async function parseSpec(source: string): Promise<ParsedSpec> {
	const api = (await SwaggerParser.dereference(source)) as OpenAPIV3.Document;
	const baseUrl = api.servers?.[0]?.url ?? '';

	const securitySchemes: SecurityScheme[] = [];
	const schemesObj = api.components?.securitySchemes ?? {};
	for (const [id, schemeRef] of Object.entries(schemesObj)) {
		const scheme = schemeRef as OpenAPIV3.SecuritySchemeObject;
		securitySchemes.push({
			id,
			type: scheme.type,
			scheme:
				scheme.type === 'http'
					? (scheme as OpenAPIV3.HttpSecurityScheme).scheme
					: undefined,
			name:
				scheme.type === 'apiKey'
					? (scheme as OpenAPIV3.ApiKeySecurityScheme).name
					: undefined,
			in:
				scheme.type === 'apiKey'
					? ((scheme as OpenAPIV3.ApiKeySecurityScheme)
							.in as SecurityScheme['in'])
					: undefined,
			description: scheme.description,
		});
	}

	const endpoints: Endpoint[] = [];

	for (const [pathStr, pathItem] of Object.entries(api.paths ?? {})) {
		if (!pathItem) continue;

		for (const method of HTTP_METHODS) {
			const operation = (pathItem as Record<string, unknown>)[method] as
				| OpenAPIV3.OperationObject
				| undefined;
			if (!operation) continue;

			const parameters: EndpointParameter[] = (
				(operation.parameters as OpenAPIV3.ParameterObject[]) ?? []
			).map((p) => ({
				name: p.name,
				location: p.in as EndpointParameter['location'],
				required: p.required ?? false,
				schema: (p.schema as Record<string, unknown>) ?? {},
				description: p.description,
			}));

			let requestBody: Record<string, unknown> | undefined;
			const requestContentTypes: string[] = [];
			if (operation.requestBody) {
				const rb = operation.requestBody as OpenAPIV3.RequestBodyObject;
				if (rb.content) {
					requestContentTypes.push(...Object.keys(rb.content));
				}
				const jsonContent = rb.content?.['application/json'];
				if (jsonContent?.schema) {
					requestBody = jsonContent.schema as Record<string, unknown>;
				} else {
					const fallbackKeys = [
						'multipart/form-data',
						'application/x-www-form-urlencoded',
						...Object.keys(rb.content ?? {}),
					];
					for (const key of fallbackKeys) {
						const content = rb.content?.[key];
						if (content?.schema) {
							requestBody = content.schema as Record<string, unknown>;
							break;
						}
					}
				}
			}

			const responses: Record<string, Record<string, unknown>> = {};
			const responseContentTypes: Record<string, string[]> = {};
			for (const [code, responseObj] of Object.entries(
				operation.responses ?? {},
			)) {
				const resp = responseObj as OpenAPIV3.ResponseObject;
				if (resp.content) {
					responseContentTypes[code] = Object.keys(resp.content);
				}
				const jsonContent = resp.content?.['application/json'];
				if (jsonContent?.schema) {
					responses[code] = jsonContent.schema as Record<string, unknown>;
				} else {
					responses[code] = {};
				}
			}

			endpoints.push({
				method,
				path: pathStr,
				summary: operation.summary ?? '',
				operationId: operation.operationId,
				tags: operation.tags ?? [],
				parameters,
				requestBody,
				responses,
				deprecated: operation.deprecated ?? false,
				contentTypes: { requestContentTypes, responseContentTypes },
			});
		}
	}

	return { endpoints, baseUrl, securitySchemes };
}
