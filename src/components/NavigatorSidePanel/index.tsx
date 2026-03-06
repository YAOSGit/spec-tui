import { Box, Text } from 'ink';
import { METHOD_COLORS } from '../../utils/methodColors/index.js';
import { statusColor } from '../../utils/statusColor/index.js';
import type { NavigatorSidePanelProps } from './NavigatorSidePanel.types.js';

export function NavigatorSidePanel({
	baseUrl,
	securitySchemes,
	endpointCount,
	selectedEndpoint,
	requestHistory,
	height,
}: NavigatorSidePanelProps) {
	const schemeNames = securitySchemes.map((s) => s.id);
	const recentHistory = requestHistory.slice(0, 8);

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="gray"
			width="60%"
			height={height}
			paddingX={1}
		>
			{/* API Overview */}
			<Box flexDirection="column">
				<Text bold dimColor>
					API Overview
				</Text>
				<Text wrap="truncate">
					<Text dimColor>Base URL: </Text>
					<Text color="cyan">{baseUrl || '(none)'}</Text>
				</Text>
				<Text wrap="truncate">
					<Text dimColor>Security: </Text>
					<Text>
						{schemeNames.length > 0 ? schemeNames.join(', ') : '(none)'}
					</Text>
				</Text>
				<Text>
					<Text dimColor>Endpoints: </Text>
					<Text>{endpointCount}</Text>
				</Text>
			</Box>

			{/* Selected Endpoint */}
			<Box flexDirection="column" marginTop={1}>
				<Text bold dimColor>
					Selected Endpoint
				</Text>
				{selectedEndpoint ? (
					<Box flexDirection="column">
						<Box gap={1}>
							<Text
								color={METHOD_COLORS[selectedEndpoint.method] ?? 'white'}
								bold
							>
								{selectedEndpoint.method.toUpperCase()}
							</Text>
							<Text wrap="truncate">{selectedEndpoint.path}</Text>
						</Box>
						{selectedEndpoint.summary && (
							<Text wrap="truncate" dimColor>
								{selectedEndpoint.summary}
							</Text>
						)}
						<Text dimColor>
							Params: {selectedEndpoint.parameters.length}
							{selectedEndpoint.tags.length > 0 &&
								` · Tags: ${selectedEndpoint.tags.join(', ')}`}
						</Text>
						{(() => {
							const allTypes = [
								...selectedEndpoint.contentTypes.requestContentTypes,
								...Object.values(
									selectedEndpoint.contentTypes.responseContentTypes,
								).flat(),
							];
							const unique = [...new Set(allTypes)];
							return unique.length > 0 ? (
								<Text dimColor wrap="truncate">
									Content: {unique.join(', ')}
								</Text>
							) : null;
						})()}
					</Box>
				) : (
					<Text dimColor>No endpoint selected</Text>
				)}
			</Box>

			{/* Recent Requests */}
			<Box flexDirection="column" marginTop={1}>
				<Text bold dimColor>
					Recent Requests
				</Text>
				{recentHistory.length === 0 ? (
					<Text dimColor>No requests yet</Text>
				) : (
					recentHistory.map((entry) => {
						const pathOnly = entry.url.split('?')[0] ?? entry.url;
						return (
							<Box key={entry.id} gap={1}>
								<Text
									color={METHOD_COLORS[entry.method.toLowerCase()] ?? 'white'}
									bold
								>
									{entry.method.toUpperCase().padEnd(7)}
								</Text>
								<Text wrap="truncate">{pathOnly}</Text>
								<Text color={statusColor(entry.response.status)}>
									{entry.response.status}
								</Text>
								<Text dimColor>{entry.response.duration}ms</Text>
							</Box>
						);
					})
				)}
			</Box>
		</Box>
	);
}
