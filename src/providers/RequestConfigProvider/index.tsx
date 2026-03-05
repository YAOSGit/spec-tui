import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useRequestConfigState } from '../../hooks/useRequestConfigState/index.js';
import type {
	RequestConfigContextValue,
	RequestConfigProviderProps,
} from './RequestConfigProvider.types.js';

const RequestConfigContext = createContext<RequestConfigContextValue | null>(
	null,
);

export const RequestConfigProvider: React.FC<RequestConfigProviderProps> = ({
	children,
}) => {
	const state = useRequestConfigState();

	const value: RequestConfigContextValue = useMemo(
		() => state,
		[
			state.globalHeaders,
			state.addHeader,
			state.removeHeader,
			state.updateHeader,
			state.authConfig,
			state.setAuthConfig,
			state.setGlobalHeaders,
		],
	);

	return (
		<RequestConfigContext.Provider value={value}>
			{children}
		</RequestConfigContext.Provider>
	);
};

export const useRequestConfig = (): RequestConfigContextValue => {
	const context = useContext(RequestConfigContext);
	if (!context) {
		throw new Error(
			'useRequestConfig must be used within a RequestConfigProvider',
		);
	}
	return context;
};
