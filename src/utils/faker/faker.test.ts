import { describe, expect, it } from 'vitest';
import {
	generateArrayParamValue,
	generateObjectFromSchema,
	generateValue,
	guessCategory,
} from './index.js';

describe('guessCategory', () => {
	it('detects email from param name', () => {
		expect(guessCategory('email', { type: 'string' })).toBe('email');
		expect(guessCategory('userEmail', { type: 'string' })).toBe('email');
	});

	it('detects name from param name', () => {
		expect(guessCategory('name', { type: 'string' })).toBe('name');
		expect(guessCategory('firstName', { type: 'string' })).toBe('name');
	});

	it('detects id with integer schema', () => {
		expect(guessCategory('petId', { type: 'integer' })).toBe('number');
	});

	it('detects boolean schema', () => {
		expect(guessCategory('active', { type: 'boolean' })).toBe('boolean');
	});

	it('detects date from format', () => {
		expect(
			guessCategory('createdAt', { type: 'string', format: 'date-time' }),
		).toBe('date');
	});

	it('detects uuid from format', () => {
		expect(guessCategory('id', { type: 'string', format: 'uuid' })).toBe(
			'uuid',
		);
	});

	it('falls back to word for generic string', () => {
		expect(guessCategory('something', { type: 'string' })).toBe('word');
	});
});

describe('generateValue', () => {
	it('returns a string for every category', () => {
		const categories = [
			'email',
			'name',
			'url',
			'uuid',
			'phone',
			'date',
			'number',
			'boolean',
			'word',
		] as const;
		for (const cat of categories) {
			const val = generateValue(cat);
			expect(typeof val).toBe('string');
			expect(val.length).toBeGreaterThan(0);
		}
	});

	it('picks from enum when provided', () => {
		const val = generateValue('word', {
			type: 'string',
			enum: ['active', 'inactive'],
		});
		expect(['active', 'inactive']).toContain(val);
	});
});

describe('generateArrayParamValue', () => {
	it('returns empty string when schema has no items', () => {
		const result = generateArrayParamValue('tags', { type: 'array' });
		expect(result).toBe('');
	});

	it('returns comma-separated values for non-enum schema', () => {
		const result = generateArrayParamValue('emails', {
			type: 'array',
			items: { type: 'string', format: 'email' },
		});
		const parts = result.split(',');
		expect(parts.length).toBe(3);
		for (const part of parts) {
			expect(part.length).toBeGreaterThan(0);
		}
	});

	it('returns comma-separated enum values when items have enum', () => {
		const result = generateArrayParamValue('statuses', {
			type: 'array',
			items: { type: 'string', enum: ['active', 'inactive', 'pending'] },
		});
		const parts = result.split(',');
		expect(parts.length).toBeGreaterThan(0);
		expect(parts.length).toBeLessThanOrEqual(3);
		for (const part of parts) {
			expect(['active', 'inactive', 'pending']).toContain(part);
		}
	});

	it('respects explicit count parameter', () => {
		const result = generateArrayParamValue(
			'ids',
			{ type: 'array', items: { type: 'string', format: 'uuid' } },
			5,
		);
		const parts = result.split(',');
		expect(parts.length).toBe(5);
	});
});

describe('generateObjectFromSchema', () => {
	it('returns empty object for schema with no properties', () => {
		const result = generateObjectFromSchema({ type: 'object' });
		expect(result).toEqual({});
	});

	it('generates nested objects', () => {
		const schema = {
			type: 'object',
			properties: {
				address: {
					type: 'object',
					properties: {
						city: { type: 'string' },
						zip: { type: 'string' },
					},
				},
			},
		};
		const result = generateObjectFromSchema(schema);
		expect(result).toHaveProperty('address');
		const address = result.address as Record<string, unknown>;
		expect(typeof address).toBe('object');
		expect(address).toHaveProperty('city');
		expect(address).toHaveProperty('zip');
		expect(typeof address.city).toBe('string');
		expect(typeof address.zip).toBe('string');
	});

	it('handles array properties with object items', () => {
		const schema = {
			type: 'object',
			properties: {
				users: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
						},
					},
				},
			},
		};
		const result = generateObjectFromSchema(schema);
		expect(result).toHaveProperty('users');
		expect(Array.isArray(result.users)).toBe(true);
		const users = result.users as Record<string, unknown>[];
		expect(users.length).toBe(1);
		expect(users[0]).toHaveProperty('name');
		expect(typeof users[0]!.name).toBe('string');
	});

	it('handles array properties with primitive items', () => {
		const schema = {
			type: 'object',
			properties: {
				tags: {
					type: 'array',
					items: { type: 'string' },
				},
			},
		};
		const result = generateObjectFromSchema(schema);
		expect(result).toHaveProperty('tags');
		expect(Array.isArray(result.tags)).toBe(true);
		const tags = result.tags as string[];
		expect(tags.length).toBe(1);
		expect(typeof tags[0]).toBe('string');
	});

	it('handles array properties with no items schema', () => {
		const schema = {
			type: 'object',
			properties: {
				misc: {
					type: 'array',
				},
			},
		};
		const result = generateObjectFromSchema(schema);
		expect(result).toHaveProperty('misc');
		expect(result.misc).toEqual([]);
	});

	it('converts number and boolean types properly', () => {
		const schema = {
			type: 'object',
			properties: {
				age: { type: 'integer' },
				score: { type: 'number' },
				active: { type: 'boolean' },
			},
		};
		const result = generateObjectFromSchema(schema);
		expect(typeof result.age).toBe('number');
		expect(typeof result.score).toBe('number');
		expect(typeof result.active).toBe('boolean');
	});
});
