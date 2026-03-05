import type { EndpointParameter } from '../../types/Endpoint/index.js';
import type { BodySchemaField } from '../../utils/bodySchema/index.js';

export interface FieldEditorProps {
	fieldName: string;
	fieldKind: 'param' | 'body' | 'bodyField';
	value: string;
	isEditing: boolean;
	onChange: (value: string) => void;
	param?: EndpointParameter;
	bodySchema?: Record<string, unknown>;
	bodyField?: BodySchemaField;
	height?: number;
	borderColor?: string;
	isArrayBody?: boolean;
	currentBodyItemIndex?: number;
	totalBodyItems?: number;
	isArrayParam?: boolean;
	paramArrayItemIndex?: number;
	paramArrayItemCount?: number;
	fileInputMode?: 'browser' | 'path';
	useRawEditor?: boolean;
}
