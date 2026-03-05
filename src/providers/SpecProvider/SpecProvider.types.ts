import type React from 'react';
import type { Endpoint } from '../../types/Endpoint/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';

export interface SpecContextValue {
	endpoints: Endpoint[];
	specTitle: string;
	baseUrl: string;
	securitySchemes: SecurityScheme[];
	loading: boolean;
	error: string | null;
}

export interface SpecProviderProps {
	specSource: string;
	baseUrlOverride?: string;
	children: React.ReactNode;
}
