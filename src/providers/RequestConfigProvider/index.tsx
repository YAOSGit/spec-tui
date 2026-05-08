import type React from 'react';
import { createContext, useMemo } from 'react';
import { useRequestConfigState } from '../../hooks/useRequestConfigState/index.js';
import type {
	RequestConfigContextValue,
	RequestConfigProviderProps,
} from './RequestConfigProvider.types.js';

export const RequestConfigContext =
	createContext<RequestConfigContextValue | null>(null);

export const RequestConfigProvider: React.FC<RequestConfigProviderProps> = ({
	children,
}) => {
	const state = useRequestConfigState();

	const value: RequestConfigContextValue = useMemo(() => state, [state]);

	return (
		<RequestConfigContext.Provider value={value}>
			{children}
		</RequestConfigContext.Provider>
	);
};

export { useRequestConfig } from '../../hooks/useRequestConfig/index.js';
