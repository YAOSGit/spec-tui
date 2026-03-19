import { useEffect, useState } from 'react';
import { parseSpec } from '../../parser/openapi/index.js';
import type { Endpoint } from '../../types/Endpoint/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';

type UseSpecStateReturn = {
	endpoints: Endpoint[];
	specTitle: string;
	baseUrl: string;
	securitySchemes: SecurityScheme[];
	loading: boolean;
	error: string | null;
};

export const useSpecState = (specSource: string): UseSpecStateReturn => {
	const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
	const [specTitle, setSpecTitle] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const [securitySchemes, setSecuritySchemes] = useState<SecurityScheme[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		parseSpec(specSource)
			.then((result) => {
				setEndpoints(result.endpoints);
				setBaseUrl(result.baseUrl);
				setSecuritySchemes(result.securitySchemes);
				setSpecTitle(specSource.split('/').pop() ?? specSource);
				setLoading(false);
			})
			.catch((err) => {
				setError(err instanceof Error ? err.message : String(err));
				setLoading(false);
			});
	}, [specSource]);

	return { endpoints, specTitle, baseUrl, securitySchemes, loading, error };
};
