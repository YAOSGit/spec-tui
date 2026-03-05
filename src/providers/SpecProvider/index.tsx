import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useSpecState } from '../../hooks/useSpecState/index.js';
import type {
	SpecContextValue,
	SpecProviderProps,
} from './SpecProvider.types.js';

const SpecContext = createContext<SpecContextValue | null>(null);

export const SpecProvider: React.FC<SpecProviderProps> = ({
	specSource,
	baseUrlOverride,
	children,
}) => {
	const { endpoints, specTitle, baseUrl, securitySchemes, loading, error } =
		useSpecState(specSource);

	const resolvedBaseUrl = baseUrlOverride || baseUrl;

	const value: SpecContextValue = useMemo(
		() => ({
			endpoints,
			specTitle,
			baseUrl: resolvedBaseUrl,
			securitySchemes,
			loading,
			error,
		}),
		[endpoints, specTitle, resolvedBaseUrl, securitySchemes, loading, error],
	);

	return <SpecContext.Provider value={value}>{children}</SpecContext.Provider>;
};

export const useSpec = (): SpecContextValue => {
	const context = useContext(SpecContext);
	if (!context) {
		throw new Error('useSpec must be used within a SpecProvider');
	}
	return context;
};
