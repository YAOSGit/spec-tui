import type { AuthConfig } from '../../types/AuthConfig/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';

export interface ConfigScreenProps {
	headers: Record<string, string>;
	onAddHeader: (key: string, value: string) => void;
	onRemoveHeader: (key: string) => void;
	onUpdateHeader: (oldKey: string, newKey: string, value: string) => void;
	authConfig: AuthConfig;
	onAuthChange: (config: AuthConfig) => void;
	securitySchemes: SecurityScheme[];
	onClose: () => void;
}
