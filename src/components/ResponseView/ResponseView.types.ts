import type { ResponseData } from '../../types/ResponseData/index.js';

export interface ResponseViewProps {
	response: ResponseData | null;
	loading: boolean;
	height?: number;
	saveMode?: boolean;
	onSave?: (filePath: string) => void;
	onCancelSave?: () => void;
	saveError?: string | null;
}
