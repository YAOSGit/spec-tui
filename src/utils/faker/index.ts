import { faker } from '@faker-js/faker';
import type { FakerCategory } from './faker.consts.js';

export function guessCategory(
	paramName: string,
	schema: Record<string, unknown>,
): FakerCategory {
	const name = paramName.toLowerCase();
	const type = schema.type as string | undefined;
	const format = schema.format as string | undefined;

	if (format === 'uuid') return 'uuid';
	if (format === 'email') return 'email';
	if (format === 'uri' || format === 'url') return 'url';
	if (format === 'date-time' || format === 'date') return 'date';

	if (type === 'boolean') return 'boolean';
	if (type === 'integer' || type === 'number') return 'number';

	if (name.includes('email')) return 'email';
	if (
		name.includes('name') ||
		name.includes('firstname') ||
		name.includes('lastname')
	)
		return 'name';
	if (name.includes('url') || name.includes('website')) return 'url';
	if (name.includes('phone') || name.includes('tel')) return 'phone';
	if (name.includes('date') || name.includes('time')) return 'date';
	if (name.includes('id') || name.includes('uuid')) return 'uuid';

	return 'word';
}

export function generateValue(
	category: FakerCategory,
	schema?: Record<string, unknown>,
): string {
	const enumValues = schema?.enum as string[] | undefined;
	if (enumValues && enumValues.length > 0) {
		return faker.helpers.arrayElement(enumValues);
	}

	switch (category) {
		case 'email':
			return faker.internet.email();
		case 'name':
			return faker.person.fullName();
		case 'url':
			return faker.internet.url();
		case 'uuid':
			return faker.string.uuid();
		case 'phone':
			return faker.phone.number();
		case 'date':
			return faker.date.recent().toISOString();
		case 'number':
			return String(faker.number.int({ min: 1, max: 100 }));
		case 'boolean':
			return String(faker.datatype.boolean());
		case 'word':
			return faker.lorem.word();
		default:
			return faker.lorem.word();
	}
}

export function generateArrayParamValue(
	paramName: string,
	schema: Record<string, unknown>,
	count?: number,
): string {
	const items = schema.items as Record<string, unknown> | undefined;
	if (!items) return '';

	const enumValues = items.enum as string[] | undefined;
	if (enumValues && enumValues.length > 0) {
		const n = count ?? Math.min(enumValues.length, 3);
		const shuffled = faker.helpers.shuffle([...enumValues]);
		return shuffled.slice(0, n).join(',');
	}

	const category = guessCategory(paramName, items);
	const n = count ?? 3;
	return Array.from({ length: n }, () => generateValue(category, items)).join(
		',',
	);
}

export function generateObjectFromSchema(
	schema: Record<string, unknown>,
): Record<string, unknown> {
	const properties = schema.properties as
		| Record<string, Record<string, unknown>>
		| undefined;
	if (!properties) return {};

	const result: Record<string, unknown> = {};
	for (const [key, propSchema] of Object.entries(properties)) {
		const propType = propSchema.type as string | undefined;
		if (propType === 'object') {
			result[key] = generateObjectFromSchema(propSchema);
		} else if (propType === 'array') {
			const items = propSchema.items as Record<string, unknown> | undefined;
			if (items?.type === 'object') {
				result[key] = [generateObjectFromSchema(items)];
			} else if (items) {
				const cat = guessCategory(key, items);
				result[key] = [generateValue(cat, items)];
			} else {
				result[key] = [];
			}
		} else {
			const cat = guessCategory(key, propSchema);
			const val = generateValue(cat, propSchema);
			if (propType === 'integer' || propType === 'number') {
				result[key] = Number(val);
			} else if (propType === 'boolean') {
				result[key] = val === 'true';
			} else {
				result[key] = val;
			}
		}
	}
	return result;
}
