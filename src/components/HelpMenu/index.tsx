import { HelpMenu as ToolkitHelpMenu } from '@yaos-git/toolkit/tui/components';
import { COMMANDS } from '../../providers/CommandsProvider/index.js';
import type { HelpMenuProps } from './HelpMenu.types.js';

const SECTION_COLORS: Record<string, string> = {
	Navigator: 'cyan',
	Detail: 'green',
	Config: 'blue',
	General: 'yellow',
};

export function HelpMenu({ onClose }: HelpMenuProps) {
	return (
		<ToolkitHelpMenu
			commands={COMMANDS}
			sectionColors={SECTION_COLORS}
			title="YAOSGit spec - Keyboard Shortcuts"
			onClose={onClose}
		/>
	);
}
