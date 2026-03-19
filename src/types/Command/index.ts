import type { SpecTuiDeps } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import type { KeyBinding } from '../KeyBinding/index.js';

export interface Command {
	id: string;
	keys: KeyBinding[];
	displayKey: string;
	displayText: string;
	footer?: 'priority' | 'optional' | 'hidden';
	footerOrder?: number;
	helpSection?: string;
	helpLabel?: string;
	isEnabled: (p: SpecTuiDeps) => boolean;
	execute: (p: SpecTuiDeps) => void;
}
