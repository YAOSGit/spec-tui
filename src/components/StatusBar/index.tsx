import { Box, Text } from 'ink';
import { METHOD_COLORS } from '../EndpointNavigator/EndpointNavigator.consts.js';
import type { StatusBarProps } from './StatusBar.types.js';

export function StatusBar({ specTitle, activePane, selectedEndpoint, activeView }: StatusBarProps) {
	const crumbs: { label: string; color?: string; bold?: boolean }[] = [
		{ label: specTitle, color: 'cyan' },
	];

	if (activePane === 'config') {
		crumbs.push({ label: 'Config' });
	} else if (activePane === 'detail' && selectedEndpoint) {
		crumbs.push({
			label: `${selectedEndpoint.method.toUpperCase()} ${selectedEndpoint.path}`,
			color: METHOD_COLORS[selectedEndpoint.method],
			bold: true,
		});
		if (activeView) {
			crumbs.push({
				label: activeView === 'request' ? 'Request' : 'Response',
			});
		}
	} else {
		crumbs.push({ label: 'Endpoints' });
	}

	return (
		<Box borderStyle="round" borderColor="gray" paddingX={1}>
			<Text wrap="truncate">
				{crumbs.map((crumb, i) => (
					<Text key={crumb.label}>
						{i > 0 && <Text dimColor> › </Text>}
						<Text color={crumb.color} bold={crumb.bold}>{crumb.label}</Text>
					</Text>
				))}
			</Text>
		</Box>
	);
}
