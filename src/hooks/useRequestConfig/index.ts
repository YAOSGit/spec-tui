import { useContext } from 'react';
import { RequestConfigContext } from '../../providers/RequestConfigProvider/index.js';
import type { RequestConfigContextValue } from '../../providers/RequestConfigProvider/RequestConfigProvider.types.js';

export const useRequestConfig = (): RequestConfigContextValue => {
	const context = useContext(RequestConfigContext);
	if (!context) {
		throw new Error(
			'useRequestConfig must be used within a RequestConfigProvider',
		);
	}
	return context;
};
