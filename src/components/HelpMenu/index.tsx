import { Box, Text, useInput } from 'ink';
import { COMMANDS } from '../../providers/CommandsProvider/CommandsProvider.consts.js';
import type { HelpMenuProps } from './HelpMenu.types.js';

const SECTION_COLORS: Record<string, string> = {
	Navigator: 'cyan',
	Detail: 'green',
	Config: 'blue',
	General: 'yellow',
};

const SECTION_ORDER = ['Navigator', 'Detail', 'Config', 'General'];

export function HelpMenu({ onClose }: HelpMenuProps) {
	useInput((input, key) => {
		if (key.escape || input === 'q' || input === 'h') {
			onClose();
		}
	});

	const sections = new Map<
		string,
		{ id: string; label: string; keys: string }[]
	>();

	for (const cmd of COMMANDS) {
		if (!cmd.helpSection) continue;
		const section = cmd.helpSection;
		if (!sections.has(section)) {
			sections.set(section, []);
		}
		const keyStr =
			cmd.displayKey ??
			cmd.keys
				.map((b) => b.textKey ?? b.specialKey ?? '')
				.filter(Boolean)
				.join(' / ');
		sections.get(section)?.push({
			id: cmd.id,
			label: cmd.helpLabel ?? cmd.displayText,
			keys: keyStr,
		});
	}

	const orderedSections = SECTION_ORDER.filter((s) => sections.has(s));

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="yellow"
			paddingX={1}
		>
			<Box paddingBottom={1}>
				<Text bold color="yellow">
					YAOSGit spec - Keyboard Shortcuts
				</Text>
			</Box>
			<Box flexDirection="row" gap={4}>
				{orderedSections.map((section) => {
					const cmds = sections.get(section) ?? [];
					const color = SECTION_COLORS[section] ?? 'white';
					return (
						<Box key={section} flexDirection="column">
							<Text bold color={color}>
								{section}
							</Text>
							{cmds.map((cmd) => (
								<Box key={cmd.id} gap={1}>
									<Text bold color="cyan">
										{cmd.keys.padEnd(10)}
									</Text>
									<Text>{cmd.label}</Text>
								</Box>
							))}
						</Box>
					);
				})}
			</Box>
			<Box paddingTop={1}>
				<Text dimColor>Press ESC, q, or h to close</Text>
			</Box>
		</Box>
	);
}
