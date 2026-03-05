import type { BodyEditMode } from '../../providers/NavigationProvider/NavigationProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';

export interface FieldItem {
	kind: 'param' | 'body' | 'bodyField';
	label: string;
	location?: string;
	required?: boolean;
	value: string;
	bodyFieldName?: string;
	typeHint?: string;
	isArrayParam?: boolean;
	arrayItemIndex?: number;
	arrayItemCount?: number;
}

export interface FieldListProps {
	endpoint: Endpoint;
	paramValues: Record<string, string>;
	bodyValue: string;
	selectedIndex: number;
	height?: number;
	bodyEditMode?: BodyEditMode;
	bodyFieldValues?: Record<string, string>;
	borderColor?: string;
	isArrayBody?: boolean;
	bodyArrayItems?: Record<string, string>[];
	currentBodyItemIndex?: number;
	paramArrayItems?: Record<string, string[]>;
	currentParamArrayIndices?: Record<string, number>;
	paramArrayRawMode?: Record<string, boolean>;
}
