import {
	closeConfigCommand,
	navigateConfigCommand,
	openConfigCommand,
	switchConfigSectionCommand,
} from '../../commands/config/index.js';
import {
	addArrayItemCommand,
	closeDetailCommand,
	editFieldCommand,
	generateFieldCommand,
	generateFieldPickerCommand,
	nextArrayItemCommand,
	nextFieldCommand,
	openDetailCommand,
	prevArrayItemCommand,
	prevFieldCommand,
	removeArrayItemCommand,
	saveResponseCommand,
	toggleBodyEditModeCommand,
	toggleFieldEditorModeCommand,
	toggleViewCommand,
} from '../../commands/detail/index.js';
import {
	navigateDownCommand,
	navigateUpCommand,
} from '../../commands/navigation/index.js';
import type { Command } from '../../types/Command/index.js';

/**
 * Project-specific commands. The toolkit's `createCommandsProvider` will
 * automatically append shared commands (help, quit, scroll, cycleFocus).
 */
export const PROJECT_COMMANDS: Command[] = [
	// Navigation
	navigateUpCommand,
	navigateDownCommand,
	openDetailCommand,
	closeDetailCommand,

	// Detail
	editFieldCommand,
	toggleViewCommand,
	nextFieldCommand,
	prevFieldCommand,
	generateFieldCommand,
	generateFieldPickerCommand,
	toggleBodyEditModeCommand,
	toggleFieldEditorModeCommand,
	saveResponseCommand,
	addArrayItemCommand,
	removeArrayItemCommand,
	prevArrayItemCommand,
	nextArrayItemCommand,

	// Config
	navigateConfigCommand,
	switchConfigSectionCommand,
	closeConfigCommand,

	// General
	openConfigCommand,
];

/**
 * Guard project commands so they don't fire when an overlay is active.
 * Config commands (which have empty execute bodies) are exempt since
 * they only serve as display hints for the footer.
 */
function withOverlayGuard(commands: Command[]): Command[] {
	const CONFIG_IDS = new Set([
		'NAVIGATE_CONFIG',
		'SWITCH_CONFIG_SECTION',
		'CLOSE_CONFIG',
	]);

	return commands.map((cmd) => {
		if (CONFIG_IDS.has(cmd.id)) return cmd;
		const originalIsEnabled = cmd.isEnabled;
		return {
			...cmd,
			isEnabled: (p) => p.ui.activeOverlay === 'none' && originalIsEnabled(p),
		} satisfies Command;
	});
}

export const GUARDED_PROJECT_COMMANDS: Command[] =
	withOverlayGuard(PROJECT_COMMANDS);
