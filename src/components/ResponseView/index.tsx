import * as fs from 'node:fs';
import * as path from 'node:path';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useEffect, useMemo, useState } from 'react';
import {
	detectContentFormat,
	formatBadgeColor,
	formatBadgeLabel,
} from '../../utils/contentType/index.js';
import { renderResponseBody } from '../../utils/responseRenderers/index.js';
import { statusColor } from '../../utils/statusColor/index.js';
import type { ResponseViewProps } from './ResponseView.types.js';

export function parseSuggestedFilename(
	headers: Record<string, string>,
	contentFormat: string,
): string {
	// Check Content-Disposition header for filename
	const disposition =
		headers['content-disposition'] ?? headers['Content-Disposition'] ?? '';
	const filenameMatch = disposition.match(/filename="?([^";\s]+)"?/);
	if (filenameMatch?.[1]) {
		return path.basename(filenameMatch[1]);
	}

	// Fall back to format-based name
	const extMap: Record<string, string> = {
		json: '.json',
		xml: '.xml',
		html: '.html',
		csv: '.csv',
		javascript: '.js',
		css: '.css',
		binary: '.bin',
		text: '.txt',
	};
	const ext = extMap[contentFormat] ?? '.bin';
	return `response${ext}`;
}

export function ResponseView({
	response,
	loading,
	height,
	saveMode,
	onSave,
	onCancelSave,
	saveError,
}: ResponseViewProps) {
	const [scrollOffset, setScrollOffset] = useState(0);
	const [savePath, setSavePath] = useState('');

	// Reset scroll when response changes
	useEffect(() => {
		setScrollOffset(0);
	}, []);

	const contentFormat = useMemo(() => {
		const ct =
			response?.headers['content-type'] ?? response?.headers['Content-Type'];
		const raw = typeof response?.body === 'string' ? response.body : '';
		return detectContentFormat(ct, raw);
	}, [response]);

	// Initialize save path when entering save mode
	useEffect(() => {
		if (saveMode && response) {
			const suggested = parseSuggestedFilename(response.headers, contentFormat);
			setSavePath(`./${suggested}`);
		}
	}, [saveMode, response, contentFormat]);

	const lines = useMemo(() => {
		if (!response) return [];
		if (response.body == null) return [];
		let raw: string;
		if (Buffer.isBuffer(response.body)) {
			raw = response.body.toString('hex');
		} else if (typeof response.body === 'string') {
			raw = response.body;
		} else {
			raw = JSON.stringify(response.body, null, 2);
		}
		return renderResponseBody(contentFormat, raw);
	}, [response, contentFormat]);

	// Available lines for body: height - border(2) - header(1) - statusGap(1) - statusLine(1) - bodyGap(1) = height - 6
	const visibleLineCount = height ? Math.max(height - 6, 1) : lines.length;
	const maxOffset = Math.max(0, lines.length - visibleLineCount);
	const clampedOffset = Math.min(scrollOffset, maxOffset);
	const visibleSlice = lines.slice(
		clampedOffset,
		clampedOffset + visibleLineCount,
	);

	const totalLines = lines.length;
	const startLine = clampedOffset + 1;
	const endLine = Math.min(clampedOffset + visibleLineCount, totalLines);
	const showScrollIndicator =
		response && !loading && totalLines > visibleLineCount;

	const badgeLabel = formatBadgeLabel(contentFormat);
	const badgeColor = formatBadgeColor(contentFormat);
	const showBadge = contentFormat !== 'json' && contentFormat !== 'text';

	// Validate save directory exists
	const savePathValid = useMemo(() => {
		if (!savePath) return false;
		try {
			const dir = path.dirname(path.resolve(savePath));
			return fs.existsSync(dir);
		} catch {
			return false;
		}
	}, [savePath]);

	useInput((input, key) => {
		if (saveMode) {
			if (key.escape) {
				onCancelSave?.();
			} else if (key.return && savePath && savePathValid) {
				onSave?.(savePath);
			}
			return;
		}
		if (!response || loading) return;
		if (key.downArrow || input === 'j') {
			setScrollOffset((prev) => Math.min(prev + 1, maxOffset));
		}
		if (key.upArrow || input === 'k') {
			setScrollOffset((prev) => Math.max(prev - 1, 0));
		}
	});

	// Save mode UI
	if (saveMode) {
		return (
			<Box
				flexDirection="column"
				borderStyle="single"
				borderColor="cyan"
				paddingX={1}
				width="100%"
				height={height}
				overflowY="hidden"
			>
				<Text bold color="cyan">
					Save Response
				</Text>
				<Box marginTop={1} flexDirection="column" gap={1}>
					<Text>Enter file path:</Text>
					<Box>
						<TextInput value={savePath} onChange={setSavePath} />
					</Box>
					<Box>
						{savePathValid ? (
							<Text color="green">✓ Ready to save</Text>
						) : (
							<Text color="red">✗ Directory does not exist</Text>
						)}
					</Box>
					{saveError && <Text color="red">Error: {saveError}</Text>}
					<Box gap={2} marginTop={1}>
						<Text dimColor>Enter — save</Text>
						<Text dimColor>Esc — cancel</Text>
					</Box>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="cyan"
			paddingX={1}
			width="100%"
			height={height}
			overflowY="hidden"
		>
			<Text bold dimColor>
				Response{showBadge ? ' ' : ''}
				{showBadge && <Text color={badgeColor}>({badgeLabel})</Text>}
			</Text>

			{loading && (
				<Box marginTop={1}>
					<Text color="yellow">Sending request...</Text>
				</Box>
			)}

			{!response && !loading && (
				<Box marginTop={1}>
					<Text dimColor>No response yet</Text>
				</Box>
			)}

			{response && !loading && (
				<Box flexDirection="column" marginTop={1}>
					<Box gap={2}>
						<Text color={statusColor(response.status)} bold>
							{response.status} {response.statusText}
						</Text>
						<Text dimColor>{response.duration}ms</Text>
						{showScrollIndicator && (
							<Text dimColor>
								{startLine}-{endLine}/{totalLines}
							</Text>
						)}
					</Box>
					<Box flexDirection="column" marginTop={1} overflowX="hidden">
						{visibleSlice.map((line, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: visible slice indices are stable
							<Text key={clampedOffset + i} wrap="truncate">
								{line || ' '}
							</Text>
						))}
					</Box>
				</Box>
			)}
		</Box>
	);
}
