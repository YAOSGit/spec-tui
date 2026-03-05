import type { SentRequest } from '../../app/app.js';
import type {
	BodyEditMode,
	DetailView,
} from '../../providers/NavigationProvider/NavigationProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';
import type { ResponseData } from '../../types/ResponseData/index.js';

export interface EndpointDetailProps {
	endpoint: Endpoint;
	paramValues: Record<string, string>;
	bodyValue: string;
	selectedFieldIndex: number;
	isEditing: boolean;
	activeView: DetailView;
	onParamChange: (key: string, value: string) => void;
	onBodyChange: (value: string) => void;
	response: ResponseData | null;
	sentRequest: SentRequest | null;
	loading: boolean;
	height?: number;
	bodyEditMode?: BodyEditMode;
	bodyFieldValues?: Record<string, string>;
	onBodyFieldChange?: (key: string, value: string) => void;
	isArrayBody?: boolean;
	bodyArrayItems?: Record<string, string>[];
	currentBodyItemIndex?: number;
	onBodyArrayFieldChange?: (fieldName: string, value: string) => void;
	paramArrayItems?: Record<string, string[]>;
	currentParamArrayIndices?: Record<string, number>;
	onParamArrayChange?: (paramName: string, value: string) => void;
	paramArrayRawMode?: Record<string, boolean>;
	fileInputMode?: Record<string, 'browser' | 'path'>;
	fieldEditorOverride?: Record<string, boolean>;
	saveMode?: boolean;
	onSave?: (filePath: string) => void;
	onCancelSave?: () => void;
	saveError?: string | null;
}
