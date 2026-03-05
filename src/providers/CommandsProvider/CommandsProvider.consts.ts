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
import { helpCommand } from '../../commands/help/index.js';
import {
	navigateDownCommand,
	navigateUpCommand,
} from '../../commands/navigation/index.js';
import { quitCommand } from '../../commands/quit/index.js';
import type { Command } from '../../types/Command/index.js';

export const COMMANDS: Command[] = [
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
	helpCommand,
	quitCommand,
];
