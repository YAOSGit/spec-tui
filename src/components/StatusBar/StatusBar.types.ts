import type {
	DetailView,
	Pane,
} from '../../providers/NavigationProvider/NavigationProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';

export interface StatusBarProps {
	specTitle: string;
	activePane: Pane;
	selectedEndpoint?: Endpoint | null;
	activeView?: DetailView;
}
