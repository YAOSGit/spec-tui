import {
	extractBodySchemaFields,
	isArrayBody,
} from '../../utils/bodySchema/index.js';

export type ArrayContext =
	| { kind: 'bodyArray' }
	| { kind: 'paramArray'; paramName: string; items: string[]; index: number }
	| null;

export function getSelectedArrayContext(p: {
	navigation: {
		selectedEndpoint: {
			parameters: { name: string; schema?: Record<string, unknown> }[];
			requestBody?: Record<string, unknown>;
		} | null;
		selectedFieldIndex: number;
		bodyEditMode: string;
		paramArrayItems: Record<string, string[]>;
		currentParamArrayIndices: Record<string, number>;
		paramArrayRawMode: Record<string, boolean>;
	};
}): ArrayContext {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return null;
	const idx = p.navigation.selectedFieldIndex;
	const paramCount = endpoint.parameters.length;

	if (idx < paramCount) {
		const param = endpoint.parameters[idx];
		if (
			param?.schema?.type === 'array' &&
			!p.navigation.paramArrayRawMode[param.name]
		) {
			const items = p.navigation.paramArrayItems[param.name] ?? [''];
			const index = p.navigation.currentParamArrayIndices[param.name] ?? 0;
			return { kind: 'paramArray', paramName: param.name, items, index };
		}
		return null;
	}

	// Body field selected
	if (endpoint.requestBody && isArrayBody(endpoint.requestBody)) {
		return { kind: 'bodyArray' };
	}
	return null;
}

export function getTotalFields(p: {
	navigation: {
		selectedEndpoint: {
			parameters: unknown[];
			requestBody?: Record<string, unknown>;
		} | null;
		bodyEditMode: string;
	};
}): number {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return 0;
	const paramCount = endpoint.parameters.length;

	if (endpoint.requestBody) {
		if (p.navigation.bodyEditMode === 'form') {
			const fields = extractBodySchemaFields(endpoint.requestBody);
			return paramCount + (fields.length > 0 ? fields.length : 1);
		}
		return paramCount + 1;
	}

	return paramCount;
}

export function isSelectedBodyFileField(p: {
	navigation: {
		selectedEndpoint: {
			parameters: unknown[];
			requestBody?: Record<string, unknown>;
		} | null;
		selectedFieldIndex: number;
		bodyEditMode: string;
	};
}): string | null {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint?.requestBody || p.navigation.bodyEditMode !== 'form')
		return null;
	const idx = p.navigation.selectedFieldIndex - endpoint.parameters.length;
	if (idx < 0) return null;
	const fields = extractBodySchemaFields(endpoint.requestBody);
	const field = fields[idx];
	return field?.type === 'file' ? field.name : null;
}

export function getSelectedFieldType(p: {
	navigation: {
		selectedEndpoint: {
			parameters: { name: string; schema?: Record<string, unknown> }[];
			requestBody?: Record<string, unknown>;
		} | null;
		selectedFieldIndex: number;
		bodyEditMode: string;
		paramArrayRawMode: Record<string, boolean>;
	};
}): 'file' | 'boolean' | 'integer' | 'array-param' | null {
	const endpoint = p.navigation.selectedEndpoint;
	if (!endpoint) return null;
	const idx = p.navigation.selectedFieldIndex;
	const paramCount = endpoint.parameters.length;

	if (idx < paramCount) {
		const param = endpoint.parameters[idx];
		if (!param) return null;
		if (param.schema?.type === 'array') return 'array-param';
		if (param.schema?.type === 'boolean') return 'boolean';
		if (param.schema?.type === 'integer') return 'integer';
		return null;
	}

	if (endpoint.requestBody && p.navigation.bodyEditMode === 'form') {
		const fields = extractBodySchemaFields(endpoint.requestBody);
		const field = fields[idx - paramCount];
		if (!field) return null;
		if (field.type === 'file') return 'file';
		if (field.type === 'boolean') return 'boolean';
		if (field.type === 'integer') return 'integer';
	}
	return null;
}
