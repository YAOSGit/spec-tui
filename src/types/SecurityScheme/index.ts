export interface SecurityScheme {
	id: string;
	type: 'http' | 'apiKey' | 'oauth2' | 'openIdConnect';
	scheme?: string;
	name?: string;
	in?: 'header' | 'query' | 'cookie';
	description?: string;
}
