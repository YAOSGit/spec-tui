import type { VisibleCommand } from '../../types/VisibleCommand/index.js';

export interface ContextHint {
	displayKey: string;
	displayText: string;
}

export interface FooterProps {
	commands: VisibleCommand[];
	contextHints?: ContextHint[];
}
