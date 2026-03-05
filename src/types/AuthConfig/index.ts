export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';

export interface AuthConfig {
	type: AuthType;
	bearer?: { token: string };
	basic?: { username: string; password: string };
	apiKey?: { name: string; value: string; location: 'header' | 'query' };
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = { type: 'none' };
