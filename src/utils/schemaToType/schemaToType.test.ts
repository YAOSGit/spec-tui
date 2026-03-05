import { describe, expect, it } from 'vitest';
import { schemaToTypeString } from './index.js';

describe('schemaToTypeString', () => {
	it('converts a simple object schema', () => {
		const schema = {
			type: 'object',
			required: ['id', 'name'],
			properties: {
				id: { type: 'integer' },
				name: { type: 'string' },
				tag: { type: 'string' },
			},
		};
		const result = schemaToTypeString(schema);
		expect(result).toContain('id: number');
		expect(result).toContain('name: string');
		expect(result).toContain('tag?: string');
	});

	it('converts an array schema', () => {
		const schema = {
			type: 'array',
			items: { type: 'string' },
		};
		const result = schemaToTypeString(schema);
		expect(result).toContain('string[]');
	});

	it('handles primitives', () => {
		expect(schemaToTypeString({ type: 'string' })).toBe('string');
		expect(schemaToTypeString({ type: 'number' })).toBe('number');
		expect(schemaToTypeString({ type: 'boolean' })).toBe('boolean');
		expect(schemaToTypeString({ type: 'integer' })).toBe('number');
	});
});
