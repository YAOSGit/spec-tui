import { assertType, describe, it } from 'vitest';
import type { AppConfig } from './index.js';

describe('AppConfig type', () => {
	it('accepts minimal config', () => {
		assertType<AppConfig>({ specSource: './petstore.yaml' });
	});

	it('accepts full config', () => {
		assertType<AppConfig>({
			specSource: 'https://api.example.com/openapi.json',
			baseUrl: 'https://staging.example.com',
			defaultHeaders: { 'X-API-Key': 'abc' },
		});
	});
});
