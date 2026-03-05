export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type EndpointParameter = {
	name: string;
	location: ParameterLocation;
	required: boolean;
	schema: Record<string, unknown>;
	description?: string;
};

export type ContentTypeInfo = {
	requestContentTypes: string[];
	responseContentTypes: Record<string, string[]>;
};

export type Endpoint = {
	method: HttpMethod;
	path: string;
	summary: string;
	operationId?: string;
	tags: string[];
	parameters: EndpointParameter[];
	requestBody?: Record<string, unknown>;
	responses: Record<string, Record<string, unknown>>;
	deprecated: boolean;
	contentTypes: ContentTypeInfo;
};
