export function schemaToTypeString(
	schema: Record<string, unknown>,
	indent = 0,
): string {
	const type = schema.type as string | undefined;

	if (type === 'string') return 'string';
	if (type === 'number' || type === 'integer') return 'number';
	if (type === 'boolean') return 'boolean';

	if (type === 'array') {
		const items = schema.items as Record<string, unknown> | undefined;
		const itemType = items ? schemaToTypeString(items, indent) : 'unknown';
		return `${itemType}[]`;
	}

	if (type === 'object') {
		const properties = schema.properties as
			| Record<string, Record<string, unknown>>
			| undefined;
		if (!properties) return 'Record<string, unknown>';

		const required = new Set((schema.required as string[]) ?? []);
		const pad = '\t'.repeat(indent + 1);
		const closePad = '\t'.repeat(indent);

		const fields = Object.entries(properties).map(([key, propSchema]) => {
			const optional = required.has(key) ? '' : '?';
			const propType = schemaToTypeString(propSchema, indent + 1);
			return `${pad}${key}${optional}: ${propType}`;
		});

		return `{\n${fields.join('\n')}\n${closePad}}`;
	}

	return 'unknown';
}

export function schemaSummary(
	schema: Record<string, unknown>,
	maxLen = 60,
): string {
	const type = schema.type as string | undefined;

	if (type === 'array') {
		const items = schema.items as Record<string, unknown> | undefined;
		return items ? `${schemaSummary(items, maxLen - 2)}[]` : 'unknown[]';
	}

	if (type === 'object') {
		const properties = schema.properties as
			| Record<string, Record<string, unknown>>
			| undefined;
		if (!properties) return 'object';
		const keys = Object.keys(properties);
		let result = '{ ';
		for (let i = 0; i < keys.length; i++) {
			const next = i < keys.length - 1 ? `${keys[i]}, ` : `${keys[i]}`;
			if (result.length + next.length + 2 > maxLen) {
				result += '…';
				break;
			}
			result += next;
		}
		return `${result} }`;
	}

	return type ?? 'unknown';
}
