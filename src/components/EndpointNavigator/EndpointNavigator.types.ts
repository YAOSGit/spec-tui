import type { Endpoint } from '../../types/Endpoint/index.js';

export interface EndpointNavigatorProps {
	endpoints: Endpoint[];
	selectedIndex: number;
	height?: number;
}
