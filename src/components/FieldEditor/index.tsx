import * as fs from 'node:fs';
import * as path from 'node:path';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { schemaSummary } from '../../utils/schemaToType/index.js';
import type { FieldEditorProps } from './FieldEditor.types.js';

function BooleanToggle({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const options = ['', 'true', 'false'];
	useInput((_input, key) => {
		const idx = options.indexOf(value);
		if (key.rightArrow || key.downArrow) {
			onChange(options[(idx + 1) % options.length]);
		}
		if (key.leftArrow || key.upArrow) {
			onChange(options[(idx - 1 + options.length) % options.length]);
		}
	});
	return (
		<Box gap={2}>
			{options.map((opt) => (
				<Text
					key={opt || 'empty'}
					color={value === opt ? 'cyan' : undefined}
					bold={value === opt}
				>
					{value === opt ? '●' : '○'} {opt || '(empty)'}
				</Text>
			))}
		</Box>
	);
}

function EnumSelector({
	options: rawOptions,
	value,
	onChange,
}: {
	options: string[];
	value: string;
	onChange: (v: string) => void;
}) {
	const options = ['', ...rawOptions];
	const [highlight, setHighlight] = useState(
		Math.max(0, options.indexOf(value)),
	);
	useInput((_input, key) => {
		if (key.downArrow || key.rightArrow) {
			setHighlight((prev) => Math.min(prev + 1, options.length - 1));
		}
		if (key.upArrow || key.leftArrow) {
			setHighlight((prev) => Math.max(prev - 1, 0));
		}
		if (key.return) {
			onChange(options[highlight]);
		}
	});
	return (
		<Box flexDirection="column">
			{options.map((opt, i) => (
				<Text
					key={opt || 'empty'}
					color={i === highlight ? 'cyan' : undefined}
					bold={i === highlight}
				>
					{value === opt ? '●' : '○'} {opt || '(empty)'}
				</Text>
			))}
		</Box>
	);
}

function FilePathInput({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	let status: { valid: boolean; label: string } = { valid: false, label: '' };
	if (value) {
		try {
			const resolved = path.resolve(value);
			const stat = fs.statSync(resolved);
			const size = stat.size;
			const label =
				size < 1024
					? `${size} B`
					: size < 1024 * 1024
						? `${(size / 1024).toFixed(1)} KB`
						: `${(size / (1024 * 1024)).toFixed(1)} MB`;
			status = {
				valid: true,
				label: `✓ ${path.basename(resolved)} (${label})`,
			};
		} catch {
			status = { valid: false, label: '✗ File not found' };
		}
	}
	return (
		<Box flexDirection="column">
			<TextInput value={value} onChange={onChange} />
			{value && (
				<Text color={status.valid ? 'green' : 'red'}>{status.label}</Text>
			)}
		</Box>
	);
}

function FileBrowser({
	value,
	onChange,
	maxRows = 12,
}: {
	value: string;
	onChange: (v: string) => void;
	maxRows?: number;
}) {
	const initialDir = value ? path.dirname(path.resolve(value)) : process.cwd();
	const [cwd, setCwd] = useState(initialDir);
	const [highlightIdx, setHighlightIdx] = useState(0);

	let entries: { name: string; isDir: boolean }[] = [];
	try {
		const dirents = fs.readdirSync(cwd, { withFileTypes: true });
		const dirs = dirents
			.filter((d) => d.isDirectory())
			.map((d) => ({ name: d.name, isDir: true }));
		const files = dirents
			.filter((d) => d.isFile())
			.map((d) => ({ name: d.name, isDir: false }));
		entries = [
			...dirs.sort((a, b) => a.name.localeCompare(b.name)),
			...files.sort((a, b) => a.name.localeCompare(b.name)),
		];
	} catch {
		entries = [];
	}

	useInput((_input, key) => {
		if (key.downArrow) {
			setHighlightIdx((prev) => Math.min(prev + 1, entries.length - 1));
		}
		if (key.upArrow) {
			setHighlightIdx((prev) => Math.max(prev - 1, 0));
		}
		if (key.return) {
			const entry = entries[highlightIdx];
			if (!entry) return;
			const fullPath = path.join(cwd, entry.name);
			if (entry.isDir) {
				setCwd(fullPath);
				setHighlightIdx(0);
			} else {
				onChange(fullPath);
			}
		}
		if (key.backspace || key.delete) {
			const parent = path.dirname(cwd);
			if (parent !== cwd) {
				setCwd(parent);
				setHighlightIdx(0);
			}
		}
	});

	const half = Math.floor(maxRows / 2);
	let start = Math.max(0, highlightIdx - half);
	const end = Math.min(entries.length, start + maxRows);
	if (end - start < maxRows) start = Math.max(0, end - maxRows);
	const visible = entries.slice(start, end);

	return (
		<Box flexDirection="column">
			<Text dimColor wrap="truncate">
				{cwd}
			</Text>
			{visible.map((entry, vi) => {
				const realIdx = start + vi;
				const selected = realIdx === highlightIdx;
				return (
					<Text
						key={entry.name}
						color={selected ? 'cyan' : entry.isDir ? 'blue' : undefined}
						bold={selected}
						wrap="truncate"
					>
						{selected ? '▸ ' : '  '}
						{entry.name}
						{entry.isDir ? '/' : ''}
					</Text>
				);
			})}
		</Box>
	);
}

function NumberStepper({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const num = Number.parseInt(value, 10) || 0;
	useInput((_input, key) => {
		if (key.upArrow) onChange(String(num + 1));
		if (key.downArrow) onChange(String(num - 1));
	});
	return (
		<Box gap={1}>
			<Text color="cyan" bold>
				▲
			</Text>
			<Text bold>{String(num)}</Text>
			<Text color="cyan" bold>
				▼
			</Text>
		</Box>
	);
}

export function FieldEditor({
	fieldName,
	value,
	isEditing,
	onChange,
	param,
	bodySchema,
	bodyField,
	height,
	borderColor = 'gray',
	isArrayBody,
	currentBodyItemIndex,
	totalBodyItems,
	isArrayParam,
	paramArrayItemIndex,
	paramArrayItemCount,
	fileInputMode,
	useRawEditor,
}: FieldEditorProps) {
	const isFileField =
		param?.schema?.format === 'binary' || bodyField?.type === 'file';
	const isBooleanField =
		param?.schema?.type === 'boolean' || bodyField?.type === 'boolean';
	const isIntegerField =
		param?.schema?.type === 'integer' || bodyField?.type === 'integer';
	const enumValues =
		(param?.schema?.enum as string[]) ?? (bodyField?.schema?.enum as string[]);
	const hasEnumValues = Array.isArray(enumValues) && enumValues.length > 0;

	let modeBadge: string | undefined;
	if (isFileField) {
		modeBadge = fileInputMode === 'path' ? 'path' : 'browser';
	} else if (useRawEditor) {
		modeBadge = 'text';
	} else if (isBooleanField) {
		modeBadge = 'toggle';
	} else if (isIntegerField) {
		modeBadge = 'stepper';
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor={borderColor}
			paddingX={1}
			width="100%"
			height={height}
			overflowY="hidden"
		>
			<Box gap={1}>
				<Text bold dimColor wrap="truncate">
					{fieldName}
				</Text>
				{modeBadge && <Text color="yellow">[{modeBadge}]</Text>}
			</Box>

			{isArrayBody &&
				currentBodyItemIndex !== undefined &&
				totalBodyItems !== undefined && (
					<Text color="magenta">
						Array item {currentBodyItemIndex + 1}/{totalBodyItems}
					</Text>
				)}
			{isArrayParam &&
				paramArrayItemIndex !== undefined &&
				paramArrayItemCount !== undefined && (
					<Text color="magenta">
						Array item {paramArrayItemIndex + 1}/{paramArrayItemCount}
					</Text>
				)}

			{/* Value row */}
			<Box marginTop={1} flexDirection="column">
				<Text>Value: </Text>
				{isEditing ? (
					isFileField ? (
						fileInputMode === 'path' ? (
							<FilePathInput value={value} onChange={onChange} />
						) : (
							<FileBrowser value={value} onChange={onChange} />
						)
					) : useRawEditor ? (
						<TextInput value={value} onChange={onChange} />
					) : isBooleanField ? (
						<BooleanToggle value={value} onChange={onChange} />
					) : isIntegerField ? (
						<NumberStepper value={value} onChange={onChange} />
					) : hasEnumValues ? (
						<EnumSelector
							options={enumValues}
							value={value}
							onChange={onChange}
						/>
					) : (
						<TextInput value={value} onChange={onChange} />
					)
				) : (
					<Text wrap="truncate" color={value ? 'green' : 'gray'}>
						{isFileField && value ? path.basename(value) : value || '(empty)'}
					</Text>
				)}
			</Box>

			{/* Metadata for params */}
			{param && (
				<Box flexDirection="column" marginTop={1}>
					{param.schema?.type != null && (
						<Text wrap="truncate" dimColor>
							Type: {String(param.schema.type)}
							{param.schema.type === 'array' && param.schema.items
								? ` of ${String((param.schema.items as Record<string, unknown>).type ?? 'unknown')}`
								: ''}
						</Text>
					)}
					<Text dimColor>Required: {param.required ? 'yes' : 'no'}</Text>
					<Text dimColor>Location: {param.location}</Text>
					{param.description && (
						<Text wrap="truncate" dimColor>
							Description: {param.description}
						</Text>
					)}
				</Box>
			)}

			{/* Metadata for bodyField */}
			{bodyField && (
				<Box flexDirection="column" marginTop={1}>
					<Text dimColor>Type: {bodyField.type}</Text>
					<Text dimColor>Required: {bodyField.required ? 'yes' : 'no'}</Text>
					{bodyField.description && (
						<Text wrap="truncate" dimColor>
							Description: {bodyField.description}
						</Text>
					)}
				</Box>
			)}

			{/* Schema preview for body */}
			{bodySchema && (
				<Box flexDirection="column" marginTop={1}>
					<Text wrap="truncate" dimColor>
						Schema: {schemaSummary(bodySchema)}
					</Text>
				</Box>
			)}
		</Box>
	);
}
