import * as path from 'node:path';
import { Box, Text } from 'ink';
import type { BodyEditMode } from '../../providers/NavigationProvider/NavigationProvider.types.js';
import { extractBodySchemaFields } from '../../utils/bodySchema/index.js';
import { schemaSummary } from '../../utils/schemaToType/index.js';
import type { FieldItem, FieldListProps } from './FieldList.types.js';

function buildFieldItems(
	endpoint: FieldListProps['endpoint'],
	paramValues: Record<string, string>,
	bodyValue: string,
	bodyEditMode?: BodyEditMode,
	bodyFieldValues?: Record<string, string>,
	paramArrayItems?: Record<string, string[]>,
	currentParamArrayIndices?: Record<string, number>,
	paramArrayRawMode?: Record<string, boolean>,
): FieldItem[] {
	const items: FieldItem[] = endpoint.parameters.map((p) => {
		const isArray = p.schema?.type === 'array';
		const isRaw = paramArrayRawMode?.[p.name] ?? false;
		if (isArray && !isRaw) {
			const arrItems = paramArrayItems?.[p.name] ?? [''];
			const arrIdx = currentParamArrayIndices?.[p.name] ?? 0;
			return {
				kind: 'param' as const,
				label: p.name,
				location: p.location,
				required: p.required,
				typeHint: (p.schema?.type as string) ?? undefined,
				value: arrItems[arrIdx] ?? '',
				isArrayParam: true,
				arrayItemIndex: arrIdx,
				arrayItemCount: arrItems.length,
			};
		}
		return {
			kind: 'param' as const,
			label: p.name,
			location: p.location,
			required: p.required,
			typeHint: (p.schema?.type as string) ?? undefined,
			value: paramValues[p.name] ?? '',
		};
	});

	if (endpoint.requestBody) {
		if (bodyEditMode === 'form') {
			const fields = extractBodySchemaFields(endpoint.requestBody);
			if (fields.length > 0) {
				for (const field of fields) {
					items.push({
						kind: 'bodyField',
						label: field.name,
						bodyFieldName: field.name,
						typeHint: field.type,
						required: field.required,
						value: bodyFieldValues?.[field.name] ?? '',
					});
				}
			} else {
				// Non-object schema — fall back to raw body
				items.push({
					kind: 'body',
					label: 'body',
					value: bodyValue,
				});
			}
		} else {
			items.push({
				kind: 'body',
				label: 'body',
				value: bodyValue,
			});
		}
	}

	return items;
}

export function FieldList({
	endpoint,
	paramValues,
	bodyValue,
	selectedIndex,
	height,
	bodyEditMode,
	bodyFieldValues,
	borderColor = 'gray',
	isArrayBody,
	bodyArrayItems,
	currentBodyItemIndex,
	paramArrayItems,
	currentParamArrayIndices,
	paramArrayRawMode,
}: FieldListProps) {
	const effectiveBodyFieldValues =
		isArrayBody && bodyArrayItems && currentBodyItemIndex !== undefined
			? (bodyArrayItems[currentBodyItemIndex] ?? {})
			: bodyFieldValues;

	const items = buildFieldItems(
		endpoint,
		paramValues,
		bodyValue,
		bodyEditMode,
		effectiveBodyFieldValues,
		paramArrayItems,
		currentParamArrayIndices,
		paramArrayRawMode,
	);

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
			<Text bold dimColor>
				Fields
				{bodyEditMode === 'form'
					? ' (form)'
					: bodyEditMode === 'json'
						? ' (json)'
						: ''}
			</Text>
			{isArrayBody && bodyArrayItems && currentBodyItemIndex !== undefined && (
				<Text bold color="magenta">
					Item {currentBodyItemIndex + 1}/{bodyArrayItems.length}
				</Text>
			)}
			{items.length === 0 && <Text dimColor>No editable fields</Text>}
			{items.map((item, i) => {
				const selected = i === selectedIndex;
				const indicator = selected ? '▸ ' : '  ';
				const isFileField = item.typeHint === 'file';
				const valuePreview = isFileField
					? item.value
						? path.basename(item.value)
						: '(no file)'
					: item.value
						? item.value.length > 20
							? `${item.value.slice(0, 20)}…`
							: item.value
						: '(empty)';

				return (
					<Box key={`${item.kind}-${item.label}`} gap={1}>
						<Text
							wrap="truncate"
							color={selected ? 'cyan' : undefined}
							bold={selected}
						>
							{indicator}
							{item.label}
						</Text>
						{item.location && (
							<Text wrap="truncate" dimColor>
								[{item.location}]
							</Text>
						)}
						{item.typeHint && (
							<Text wrap="truncate" dimColor>
								:{item.typeHint}
							</Text>
						)}
						{item.required && <Text color="red">*</Text>}
						<Text
							wrap="truncate"
							color={
								isFileField
									? item.value
										? 'green'
										: 'yellow'
									: item.value
										? 'green'
										: 'gray'
							}
						>
							{valuePreview}
						</Text>
						{item.isArrayParam &&
							item.arrayItemIndex !== undefined &&
							item.arrayItemCount !== undefined && (
								<Text color="magenta">
									[{item.arrayItemIndex + 1}/{item.arrayItemCount}]
								</Text>
							)}
					</Box>
				);
			})}

			{/* Response schemas (read-only info) */}
			{Object.keys(endpoint.responses).length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text bold dimColor>
						Schemas
					</Text>
					{Object.entries(endpoint.responses).map(([code, schema]) => (
						<Box key={code} gap={1}>
							<Text color={code.startsWith('2') ? 'green' : 'yellow'}>
								{code}
							</Text>
							<Text wrap="truncate" dimColor>
								{Object.keys(schema).length > 0
									? schemaSummary(schema)
									: 'empty'}
							</Text>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

export { buildFieldItems };
export type { FieldItem };
