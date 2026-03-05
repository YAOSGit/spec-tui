import type { AuthConfig } from '../../types/AuthConfig/index.js';

export interface RequestConfigContextValue {
	globalHeaders: Record<string, string>;
	setGlobalHeaders: (headers: Record<string, string>) => void;
	addHeader: (key: string, value: string) => void;
	removeHeader: (key: string) => void;
	updateHeader: (oldKey: string, newKey: string, value: string) => void;
	authConfig: AuthConfig;
	setAuthConfig: (config: AuthConfig) => void;
}

export interface RequestConfigProviderProps {
	children: React.ReactNode;
}
