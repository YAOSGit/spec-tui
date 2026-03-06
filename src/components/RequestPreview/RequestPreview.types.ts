import type { SentRequest } from '../../types/SentRequest/index.js';

export interface RequestPreviewProps {
	request: SentRequest | null;
	loading: boolean;
	height?: number;
}
