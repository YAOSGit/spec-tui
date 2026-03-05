import type { Endpoint } from '../../types/Endpoint/index.js';
import type { HistoryEntry } from '../../types/ResponseData/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';

export interface NavigatorSidePanelProps {
	baseUrl: string;
	securitySchemes: SecurityScheme[];
	endpointCount: number;
	selectedEndpoint: Endpoint | null;
	requestHistory: HistoryEntry[];
	height?: number;
}
