import { useCallback, useState } from 'react';
import {
	type AuthConfig,
	DEFAULT_AUTH_CONFIG,
} from '../../types/AuthConfig/index.js';

export const useRequestConfigState = () => {
	const [globalHeaders, setGlobalHeaders] = useState<Record<string, string>>(
		{},
	);
	const [authConfig, setAuthConfig] = useState<AuthConfig>(DEFAULT_AUTH_CONFIG);

	const addHeader = useCallback((key: string, value: string) => {
		setGlobalHeaders((prev) => ({ ...prev, [key]: value }));
	}, []);

	const removeHeader = useCallback((key: string) => {
		setGlobalHeaders((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
	}, []);

	const updateHeader = useCallback(
		(oldKey: string, newKey: string, value: string) => {
			setGlobalHeaders((prev) => {
				const next = { ...prev };
				if (oldKey !== newKey) delete next[oldKey];
				next[newKey] = value;
				return next;
			});
		},
		[],
	);

	return {
		globalHeaders,
		setGlobalHeaders,
		addHeader,
		removeHeader,
		updateHeader,
		authConfig,
		setAuthConfig,
	};
};
