import { Box, Text } from 'ink';
import { useMemo } from 'react';
import type { Endpoint } from '../../types/Endpoint/index.js';
import { METHOD_COLORS } from './EndpointNavigator.consts.js';
import type { EndpointNavigatorProps } from './EndpointNavigator.types.js';

type DisplayRow =
	| { type: 'group'; label: string }
	| { type: 'endpoint'; flatIndex: number; endpoint: Endpoint };

function getGroupKey(path: string): string {
	const segments = path.split('/').filter(Boolean);
	return segments[0] ? `/${segments[0]}` : '/';
}

function buildDisplayRows(endpoints: Endpoint[]): DisplayRow[] {
	const rows: DisplayRow[] = [];
	let lastGroup = '';

	for (let i = 0; i < endpoints.length; i++) {
		const ep = endpoints[i]!;
		const group = getGroupKey(ep.path);
		if (group !== lastGroup) {
			rows.push({ type: 'group', label: group });
			lastGroup = group;
		}
		rows.push({ type: 'endpoint', flatIndex: i, endpoint: ep });
	}

	return rows;
}

export function EndpointNavigator({
	endpoints,
	selectedIndex,
	height,
}: EndpointNavigatorProps) {
	const displayRows = useMemo(() => buildDisplayRows(endpoints), [endpoints]);

	// Find the display row index that corresponds to selectedIndex
	const selectedDisplayIdx = displayRows.findIndex(
		(r) => r.type === 'endpoint' && r.flatIndex === selectedIndex,
	);

	// 2 rows for border, 1 for header = 3 chrome rows
	const listHeight = height ? Math.max(height - 3, 1) : displayRows.length;

	let startIdx = 0;
	if (displayRows.length > listHeight) {
		startIdx = Math.min(
			Math.max(selectedDisplayIdx - Math.floor(listHeight / 2), 0),
			displayRows.length - listHeight,
		);
	}
	const visible = displayRows.slice(startIdx, startIdx + listHeight);

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="gray"
			width="40%"
			height={height}
		>
			<Box paddingX={1}>
				<Text bold>Endpoints</Text>
			</Box>
			{visible.map((row, vi) => {
				if (row.type === 'group') {
					return (
						<Box key={`group-${row.label}`} paddingX={1}>
							<Text bold dimColor>
								{row.label}
							</Text>
						</Box>
					);
				}

				const isSelected = row.flatIndex === selectedIndex;
				const methodColor = METHOD_COLORS[row.endpoint.method] ?? 'white';
				const nonJsonTypes = [
					...row.endpoint.contentTypes.requestContentTypes,
					...Object.values(row.endpoint.contentTypes.responseContentTypes).flat(),
				].filter((ct) => !ct.includes('json'));
				const uniqueBadges = [...new Set(nonJsonTypes)]
					.map((ct) => ct.replace(/^(application|text)\//, '').toUpperCase())
					.slice(0, 2);
				return (
					<Box key={`${row.endpoint.method}-${row.endpoint.path}`} paddingX={1}>
						<Text wrap="truncate" inverse={isSelected}>
							{'  '}
							<Text color={methodColor} bold>
								{row.endpoint.method.toUpperCase().padEnd(7)}
							</Text>
							<Text dimColor={row.endpoint.deprecated}>
								{row.endpoint.path}
							</Text>
							{uniqueBadges.map((badge) => (
								<Text key={badge} dimColor>
									{' '}[{badge}]
								</Text>
							))}
						</Text>
					</Box>
				);
			})}
		</Box>
	);
}
