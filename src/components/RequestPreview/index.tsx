import { Box, Text } from 'ink';
import type { SentRequest } from '../../app/app.js';

export interface RequestPreviewProps {
	request: SentRequest | null;
	loading: boolean;
	height?: number;
}

export function RequestPreview({ request, loading, height }: RequestPreviewProps) {
	if (!request && !loading) {
		return (
			<Box
				flexDirection="column"
				borderStyle="single"
				borderColor="gray"
				paddingX={1}
				width="100%"
				height={height}
				overflowY="hidden"
			>
				<Text bold dimColor>
					Request
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Press s to send a request</Text>
				</Box>
			</Box>
		);
	}

	const headerEntries = request ? Object.entries(request.headers) : [];
	const bodyText = request?.body != null
		? typeof request.body === 'string'
			? request.body
			: JSON.stringify(request.body, null, 2)
		: null;

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="gray"
			paddingX={1}
			width="100%"
			height={height}
			overflowY="hidden"
		>
			<Text bold dimColor>
				Request
			</Text>

			{loading && !request && (
				<Box marginTop={1}>
					<Text color="yellow">Preparing...</Text>
				</Box>
			)}

			{request && (
				<Box flexDirection="column" marginTop={1}>
					{/* Method + URL */}
					<Box gap={1}>
						<Text color="cyan" bold>
							{request.method}
						</Text>
						<Text wrap="truncate">{request.url}</Text>
					</Box>

					{/* Headers */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold dimColor>Headers</Text>
						{headerEntries.length > 0 ? (
							headerEntries.map(([key, value]) => (
								<Text key={key} wrap="truncate" dimColor>
									{key}: {value}
								</Text>
							))
						) : (
							<Text dimColor>(none)</Text>
						)}
					</Box>

					{/* Body */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold dimColor>Body</Text>
						{bodyText ? (
							bodyText.split('\n').map((line, i) => (
								<Text key={i} wrap="truncate">
									{line || ' '}
								</Text>
							))
						) : (
							<Text dimColor>(none)</Text>
						)}
					</Box>
				</Box>
			)}
		</Box>
	);
}
