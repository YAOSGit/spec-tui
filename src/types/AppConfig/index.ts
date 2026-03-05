export type AppConfig = {
	/** Path or URL to OpenAPI spec file */
	specSource: string;
	/** Base URL override (otherwise from spec servers[0]) */
	baseUrl?: string;
	/** Default headers sent with every request */
	defaultHeaders?: Record<string, string>;
};
