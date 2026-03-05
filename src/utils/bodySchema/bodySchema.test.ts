import { describe, it, expect, vi } from 'vitest';
import type { BodySchemaField } from './index.js';
import {
	isArrayBody,
	extractBodySchemaFields,
	serializeBodyFields,
	serializeBodyArrayFields,
	hasFileFields,
	isMultipartEndpoint,
	buildMultipartBody,
} from './index.js';

vi.mock('node:fs', () => ({
	createReadStream: vi.fn((p: string) => `mock-stream:${p}`),
}));

describe('isArrayBody', () => {
	it('returns true for array of objects', () => {
		expect(isArrayBody({ type: 'array', items: { type: 'object' } })).toBe(true);
	});

	it('returns false when type is not array', () => {
		expect(isArrayBody({ type: 'object' })).toBe(false);
	});

	it('returns false for array of primitives', () => {
		expect(isArrayBody({ type: 'array', items: { type: 'string' } })).toBe(false);
	});

	it('returns false when items is missing', () => {
		expect(isArrayBody({ type: 'array' })).toBe(false);
	});

	it('returns false for empty schema', () => {
		expect(isArrayBody({})).toBe(false);
	});

	it('returns false for array of arrays', () => {
		expect(isArrayBody({ type: 'array', items: { type: 'array' } })).toBe(false);
	});
});

describe('extractBodySchemaFields', () => {
	it('extracts fields from object schema', () => {
		const schema = {
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string', description: 'User name' },
				age: { type: 'integer' },
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields).toEqual([
			{
				name: 'name',
				type: 'string',
				required: true,
				description: 'User name',
				schema: { type: 'string', description: 'User name' },
			},
			{
				name: 'age',
				type: 'integer',
				required: false,
				description: undefined,
				schema: { type: 'integer' },
			},
		]);
	});

	it('extracts fields from array-of-objects schema', () => {
		const schema = {
			type: 'array',
			items: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'integer' },
					label: { type: 'string' },
				},
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields).toHaveLength(2);
		expect(fields[0]!.name).toBe('id');
		expect(fields[0]!.required).toBe(true);
		expect(fields[1]!.name).toBe('label');
		expect(fields[1]!.required).toBe(false);
	});

	it('maps format=binary to type file', () => {
		const schema = {
			type: 'object',
			properties: {
				avatar: { type: 'string', format: 'binary' },
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields[0]!.type).toBe('file');
	});

	it('does not map non-string binary format to file', () => {
		const schema = {
			type: 'object',
			properties: {
				data: { type: 'integer', format: 'binary' },
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields[0]!.type).toBe('integer');
	});

	it('returns empty array for object with no properties', () => {
		expect(extractBodySchemaFields({ type: 'object' })).toEqual([]);
	});

	it('returns empty array for empty schema', () => {
		expect(extractBodySchemaFields({})).toEqual([]);
	});

	it('returns empty array for primitive type', () => {
		expect(extractBodySchemaFields({ type: 'string' })).toEqual([]);
	});

	it('returns empty array for array of primitives', () => {
		const schema = { type: 'array', items: { type: 'string' } };
		expect(extractBodySchemaFields(schema)).toEqual([]);
	});

	it('returns empty array for array without items', () => {
		expect(extractBodySchemaFields({ type: 'array' })).toEqual([]);
	});

	it('handles schema with no required array', () => {
		const schema = {
			type: 'object',
			properties: {
				foo: { type: 'string' },
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields[0]!.required).toBe(false);
	});

	it('defaults type to unknown when missing', () => {
		const schema = {
			type: 'object',
			properties: {
				mystery: {},
			},
		};
		const fields = extractBodySchemaFields(schema);
		expect(fields[0]!.type).toBe('unknown');
	});
});

describe('serializeBodyFields', () => {
	const fields: BodySchemaField[] = [
		{ name: 'name', type: 'string', required: true, schema: { type: 'string' } },
		{ name: 'age', type: 'integer', required: false, schema: { type: 'integer' } },
		{ name: 'score', type: 'number', required: false, schema: { type: 'number' } },
		{ name: 'active', type: 'boolean', required: false, schema: { type: 'boolean' } },
		{ name: 'meta', type: 'object', required: false, schema: { type: 'object' } },
		{ name: 'tags', type: 'array', required: false, schema: { type: 'array' } },
	];

	it('serializes string values as-is', () => {
		const result = JSON.parse(serializeBodyFields(fields, { name: 'Alice' }));
		expect(result.name).toBe('Alice');
	});

	it('coerces integer values', () => {
		const result = JSON.parse(serializeBodyFields(fields, { age: '30' }));
		expect(result.age).toBe(30);
	});

	it('coerces number values', () => {
		const result = JSON.parse(serializeBodyFields(fields, { score: '9.5' }));
		expect(result.score).toBe(9.5);
	});

	it('coerces boolean true', () => {
		const result = JSON.parse(serializeBodyFields(fields, { active: 'true' }));
		expect(result.active).toBe(true);
	});

	it('coerces boolean false', () => {
		const result = JSON.parse(serializeBodyFields(fields, { active: 'false' }));
		expect(result.active).toBe(false);
	});

	it('returns raw string for non-boolean string in boolean field', () => {
		const result = JSON.parse(serializeBodyFields(fields, { active: 'yes' }));
		expect(result.active).toBe('yes');
	});

	it('parses JSON for object type', () => {
		const result = JSON.parse(serializeBodyFields(fields, { meta: '{"key":"val"}' }));
		expect(result.meta).toEqual({ key: 'val' });
	});

	it('returns raw string for invalid JSON in object field', () => {
		const result = JSON.parse(serializeBodyFields(fields, { meta: 'not-json' }));
		expect(result.meta).toBe('not-json');
	});

	it('parses JSON for array type', () => {
		const result = JSON.parse(serializeBodyFields(fields, { tags: '["a","b"]' }));
		expect(result.tags).toEqual(['a', 'b']);
	});

	it('returns raw string for invalid JSON in array field', () => {
		const result = JSON.parse(serializeBodyFields(fields, { tags: '[broken' }));
		expect(result.tags).toBe('[broken');
	});

	it('returns raw string for non-numeric integer value', () => {
		const result = JSON.parse(serializeBodyFields(fields, { age: 'abc' }));
		expect(result.age).toBe('abc');
	});

	it('skips empty string values', () => {
		const result = JSON.parse(serializeBodyFields(fields, { name: '' }));
		expect(result).toEqual({});
	});

	it('skips undefined values', () => {
		const result = JSON.parse(serializeBodyFields(fields, {}));
		expect(result).toEqual({});
	});

	it('produces pretty-printed JSON', () => {
		const raw = serializeBodyFields(fields, { name: 'A' });
		expect(raw).toBe(JSON.stringify({ name: 'A' }, null, 2));
	});

	it('handles all fields empty', () => {
		const result = JSON.parse(
			serializeBodyFields(fields, {
				name: '',
				age: '',
				score: '',
				active: '',
				meta: '',
				tags: '',
			}),
		);
		expect(result).toEqual({});
	});

	it('handles negative numbers', () => {
		const result = JSON.parse(serializeBodyFields(fields, { score: '-3.14' }));
		expect(result.score).toBe(-3.14);
	});

	it('handles zero as integer', () => {
		const result = JSON.parse(serializeBodyFields(fields, { age: '0' }));
		// '0' is a non-empty string so serializeOneItem passes it to coerceValue.
		// coerceValue checks `if (!raw)` -- but !'0' is false (non-empty string), so
		// it proceeds and Number('0') === 0 which is not NaN, resulting in 0.
		expect(result).toEqual({ age: 0 });
	});
});

describe('serializeBodyArrayFields', () => {
	const fields: BodySchemaField[] = [
		{ name: 'id', type: 'integer', required: true, schema: { type: 'integer' } },
		{ name: 'value', type: 'string', required: false, schema: { type: 'string' } },
	];

	it('serializes multiple items into a JSON array', () => {
		const items = [
			{ id: '1', value: 'first' },
			{ id: '2', value: 'second' },
		];
		const result = JSON.parse(serializeBodyArrayFields(fields, items));
		expect(result).toEqual([
			{ id: 1, value: 'first' },
			{ id: 2, value: 'second' },
		]);
	});

	it('returns empty array for no items', () => {
		const result = JSON.parse(serializeBodyArrayFields(fields, []));
		expect(result).toEqual([]);
	});

	it('skips empty values in each item', () => {
		const items = [{ id: '1', value: '' }];
		const result = JSON.parse(serializeBodyArrayFields(fields, items));
		expect(result).toEqual([{ id: 1 }]);
	});

	it('produces pretty-printed JSON', () => {
		const raw = serializeBodyArrayFields(fields, [{ id: '1', value: 'a' }]);
		expect(raw).toBe(JSON.stringify([{ id: 1, value: 'a' }], null, 2));
	});
});

describe('hasFileFields', () => {
	it('returns true when a file field exists', () => {
		const fields: BodySchemaField[] = [
			{ name: 'doc', type: 'file', required: true, schema: { type: 'string', format: 'binary' } },
			{ name: 'name', type: 'string', required: false, schema: { type: 'string' } },
		];
		expect(hasFileFields(fields)).toBe(true);
	});

	it('returns false when no file fields exist', () => {
		const fields: BodySchemaField[] = [
			{ name: 'name', type: 'string', required: false, schema: { type: 'string' } },
		];
		expect(hasFileFields(fields)).toBe(false);
	});

	it('returns false for empty fields', () => {
		expect(hasFileFields([])).toBe(false);
	});
});

describe('isMultipartEndpoint', () => {
	it('returns true when multipart/form-data is present', () => {
		const endpoint = {
			contentTypes: { requestContentTypes: ['multipart/form-data'] },
		};
		expect(isMultipartEndpoint(endpoint)).toBe(true);
	});

	it('returns true when multipart/form-data is among several types', () => {
		const endpoint = {
			contentTypes: { requestContentTypes: ['application/json', 'multipart/form-data'] },
		};
		expect(isMultipartEndpoint(endpoint)).toBe(true);
	});

	it('returns false when multipart/form-data is absent', () => {
		const endpoint = {
			contentTypes: { requestContentTypes: ['application/json'] },
		};
		expect(isMultipartEndpoint(endpoint)).toBe(false);
	});

	it('returns false for empty content types', () => {
		const endpoint = {
			contentTypes: { requestContentTypes: [] },
		};
		expect(isMultipartEndpoint(endpoint)).toBe(false);
	});

	it('matches partial content type string containing multipart/form-data', () => {
		const endpoint = {
			contentTypes: { requestContentTypes: ['multipart/form-data; boundary=something'] },
		};
		expect(isMultipartEndpoint(endpoint)).toBe(true);
	});
});

describe('buildMultipartBody', () => {
	it('builds FormData with string fields', () => {
		const fields: BodySchemaField[] = [
			{ name: 'title', type: 'string', required: true, schema: { type: 'string' } },
			{ name: 'count', type: 'integer', required: false, schema: { type: 'integer' } },
		];
		const form = buildMultipartBody(fields, { title: 'hello', count: '5' });
		expect(form).toBeDefined();
		// FormData from 'form-data' exposes getBuffer / getBoundary
		const boundary = form.getBoundary();
		expect(boundary).toBeTruthy();
	});

	it('appends file fields via createReadStream', async () => {
		const fs = await import('node:fs');
		const fields: BodySchemaField[] = [
			{ name: 'avatar', type: 'file', required: true, schema: { type: 'string', format: 'binary' } },
		];
		const form = buildMultipartBody(fields, { avatar: '/tmp/photo.png' });
		expect(fs.createReadStream).toHaveBeenCalled();
		const calledPath = (fs.createReadStream as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
		// path.resolve('/tmp/photo.png') should stay as /tmp/photo.png on POSIX
		expect(calledPath).toContain('photo.png');
		expect(form).toBeDefined();
	});

	it('skips empty string values', () => {
		const fields: BodySchemaField[] = [
			{ name: 'name', type: 'string', required: false, schema: { type: 'string' } },
		];
		const form = buildMultipartBody(fields, { name: '' });
		// The form should have no appended fields; getBuffer returns only boundary markers
		const buffer = form.getBuffer().toString();
		// An empty form-data still has boundary but no Content-Disposition lines for 'name'
		expect(buffer).not.toContain('name="name"');
	});

	it('skips undefined values', () => {
		const fields: BodySchemaField[] = [
			{ name: 'missing', type: 'string', required: false, schema: { type: 'string' } },
		];
		const form = buildMultipartBody(fields, {});
		const buffer = form.getBuffer().toString();
		expect(buffer).not.toContain('name="missing"');
	});

	it('handles mixed file and string fields', async () => {
		const fs = await import('node:fs');
		(fs.createReadStream as ReturnType<typeof vi.fn>).mockClear();

		const fields: BodySchemaField[] = [
			{ name: 'description', type: 'string', required: false, schema: { type: 'string' } },
			{ name: 'attachment', type: 'file', required: true, schema: { type: 'string', format: 'binary' } },
		];
		const form = buildMultipartBody(fields, {
			description: 'A file',
			attachment: '/home/user/doc.pdf',
		});
		expect(fs.createReadStream).toHaveBeenCalledTimes(1);
		const buffer = form.getBuffer().toString();
		expect(buffer).toContain('name="description"');
	});
});
