import * as fs from 'node:fs';
import * as path from 'node:path';
import FormData from 'form-data';

export interface BodySchemaField {
	name: string;
	type: string;
	required: boolean;
	description?: string;
	schema: Record<string, unknown>;
}

export function isArrayBody(requestBody: Record<string, unknown>): boolean {
	if (requestBody.type !== 'array') return false;
	const items = requestBody.items as Record<string, unknown> | undefined;
	return items?.type === 'object';
}

function extractFromObject(schema: Record<string, unknown>): BodySchemaField[] {
	const properties = schema.properties as
		| Record<string, Record<string, unknown>>
		| undefined;
	if (!properties) return [];

	const requiredSet = new Set((schema.required as string[]) ?? []);

	return Object.entries(properties).map(([name, propSchema]) => {
		const schemaType = (propSchema.type as string) ?? 'unknown';
		const schemaFormat = propSchema.format as string | undefined;
		const isFile = schemaType === 'string' && schemaFormat === 'binary';
		return {
			name,
			type: isFile ? 'file' : schemaType,
			required: requiredSet.has(name),
			description: propSchema.description as string | undefined,
			schema: propSchema,
		};
	});
}

export function extractBodySchemaFields(
	requestBody: Record<string, unknown>,
): BodySchemaField[] {
	const type = requestBody.type as string | undefined;

	if (type === 'object') return extractFromObject(requestBody);

	if (type === 'array') {
		const items = requestBody.items as Record<string, unknown> | undefined;
		if (items?.type === 'object') return extractFromObject(items);
	}

	return [];
}

function coerceValue(raw: string, schemaType: string): unknown {
	if (!raw) return undefined;

	if (schemaType === 'number' || schemaType === 'integer') {
		const n = Number(raw);
		return Number.isNaN(n) ? raw : n;
	}

	if (schemaType === 'boolean') {
		if (raw === 'true') return true;
		if (raw === 'false') return false;
		return raw;
	}

	if (schemaType === 'object' || schemaType === 'array') {
		try {
			return JSON.parse(raw);
		} catch {
			return raw;
		}
	}

	return raw;
}

function serializeOneItem(
	fields: BodySchemaField[],
	values: Record<string, string>,
): Record<string, unknown> {
	const obj: Record<string, unknown> = {};
	for (const field of fields) {
		const raw = values[field.name];
		if (raw === undefined || raw === '') continue;
		obj[field.name] = coerceValue(raw, field.type);
	}
	return obj;
}

export function serializeBodyFields(
	fields: BodySchemaField[],
	values: Record<string, string>,
): string {
	return JSON.stringify(serializeOneItem(fields, values), null, 2);
}

export function serializeBodyArrayFields(
	fields: BodySchemaField[],
	items: Record<string, string>[],
): string {
	const arr = items.map((item) => serializeOneItem(fields, item));
	return JSON.stringify(arr, null, 2);
}

export function hasFileFields(fields: BodySchemaField[]): boolean {
	return fields.some((f) => f.type === 'file');
}

export function isMultipartEndpoint(endpoint: {
	contentTypes: { requestContentTypes: string[] };
}): boolean {
	return endpoint.contentTypes.requestContentTypes.some((ct) =>
		ct.includes('multipart/form-data'),
	);
}

export function buildMultipartBody(
	fields: BodySchemaField[],
	values: Record<string, string>,
): FormData {
	const form = new FormData();
	for (const field of fields) {
		const raw = values[field.name];
		if (raw === undefined || raw === '') continue;
		if (field.type === 'file') {
			const resolved = path.resolve(raw);
			form.append(field.name, fs.createReadStream(resolved));
		} else {
			form.append(field.name, raw);
		}
	}
	return form;
}
