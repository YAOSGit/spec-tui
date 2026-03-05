import { Box, Text } from 'ink';
import type { FooterProps } from './Footer.types.js';

export function Footer({ commands, contextHints }: FooterProps) {
	const terminalWidth = process.stdout.columns || 80;
	const availableWidth = terminalWidth - 8;
	let currentWidth = 14; // "YAOSGit : spec"

	const priorityCommands = commands.filter((cmd) => cmd.priority);
	const optionalCommands = commands.filter((cmd) => !cmd.priority);

	const truncatedCommands: typeof commands = [];

	// Priority commands always shown
	for (const cmd of priorityCommands) {
		const cmdWidth =
			3 + String(cmd.displayKey).length + 1 + cmd.displayText.length;
		truncatedCommands.push(cmd);
		currentWidth += cmdWidth;
	}

	// Fill remainder with optional commands
	for (const cmd of optionalCommands) {
		const cmdWidth =
			3 + String(cmd.displayKey).length + 1 + cmd.displayText.length;
		if (currentWidth + cmdWidth <= availableWidth) {
			truncatedCommands.push(cmd);
			currentWidth += cmdWidth;
		} else {
			break;
		}
	}

	// Preserve original registration order
	const finalCommands = commands.filter((cmd) =>
		truncatedCommands.includes(cmd),
	);

	return (
		<Box borderStyle="round" borderColor="gray" paddingX={1}>
			<Text wrap="end">
				<Text bold color="magenta">
					YAOSGit
					<Text dimColor> : </Text>
					spec
				</Text>
				{finalCommands.map((cmd) => (
					<Text key={`${cmd.displayKey}-${cmd.displayText}`}>
						<Text dimColor> │ </Text>
						<Text bold>{cmd.displayKey}</Text> {cmd.displayText}
					</Text>
				))}
				{contextHints?.map((hint) => (
					<Text key={`${hint.displayKey}-${hint.displayText}`}>
						<Text dimColor> │ </Text>
						<Text bold>{hint.displayKey}</Text> {hint.displayText}
					</Text>
				))}
			</Text>
		</Box>
	);
}
