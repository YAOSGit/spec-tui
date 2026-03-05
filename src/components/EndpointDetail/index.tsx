import { Box, Text } from 'ink';
import { extractBodySchemaFields } from '../../utils/bodySchema/index.js';
import {
	detectContentFormat,
	formatBadgeColor,
	formatBadgeLabel,
} from '../../utils/contentType/index.js';
import { METHOD_COLORS } from '../EndpointNavigator/EndpointNavigator.consts.js';
import { FieldEditor } from '../FieldEditor/index.js';
import { buildFieldItems, FieldList } from '../FieldList/index.js';
import { RequestPreview } from '../RequestPreview/index.js';
import { ResponseView } from '../ResponseView/index.js';
import type { EndpointDetailProps } from './EndpointDetail.types.js';

export function EndpointDetail({
	endpoint,
	paramValues,
	bodyValue,
	selectedFieldIndex,
	isEditing,
	activeView,
	onParamChange,
	onBodyChange,
	response,
	sentRequest,
	loading,
	height,
	bodyEditMode,
	bodyFieldValues,
	onBodyFieldChange,
	isArrayBody,
	bodyArrayItems,
	currentBodyItemIndex,
	onBodyArrayFieldChange,
	paramArrayItems,
	currentParamArrayIndices,
	onParamArrayChange,
	paramArrayRawMode,
	fileInputMode,
	fieldEditorOverride,
	saveMode,
	onSave,
	onCancelSave,
	saveError,
}: EndpointDetailProps) {
	const methodColor = METHOD_COLORS[endpoint.method] ?? 'white';

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
	const selectedItem = items[selectedFieldIndex];

	const handleValueChange = (value: string) => {
		if (!selectedItem) return;
		if (selectedItem.kind === 'param') {
			if (selectedItem.isArrayParam && onParamArrayChange) {
				onParamArrayChange(selectedItem.label, value);
			} else {
				onParamChange(selectedItem.label, value);
			}
		} else if (selectedItem.kind === 'bodyField') {
			if (isArrayBody && onBodyArrayFieldChange) {
				onBodyArrayFieldChange(selectedItem.label, value);
			} else if (onBodyFieldChange) {
				onBodyFieldChange(selectedItem.label, value);
			}
		} else {
			onBodyChange(value);
		}
	};

	// Resolve the param object for the selected field (if it's a param)
	const selectedParam =
		selectedItem?.kind === 'param'
			? endpoint.parameters.find((p) => p.name === selectedItem.label)
			: undefined;

	// Resolve bodyField metadata for form fields
	const selectedBodyField =
		selectedItem?.kind === 'bodyField' && endpoint.requestBody
			? extractBodySchemaFields(endpoint.requestBody).find(
					(f) => f.name === selectedItem.label,
				)
			: undefined;

	const selectedFileInputMode =
		selectedItem?.kind === 'bodyField'
			? fileInputMode?.[selectedItem.label]
			: undefined;
	const selectedFieldKey = selectedItem
		? selectedItem.kind === 'param'
			? `param:${selectedItem.label}`
			: `body:${selectedItem.label}`
		: undefined;
	const selectedUseRawEditor = selectedFieldKey
		? (fieldEditorOverride?.[selectedFieldKey] ?? false)
		: false;

	// Header (1) + view indicator with paddingY (3) = 4 chrome rows
	const panelHeight = height ? Math.max(height - 4, 2) : undefined;

	return (
		<Box flexDirection="column" paddingX={1} height={height} width="100%">
			{/* Header */}
			<Box gap={1}>
				<Text color={methodColor} bold>
					{endpoint.method.toUpperCase()}
				</Text>
				<Text bold wrap="truncate">
					{endpoint.path}
				</Text>
				{endpoint.summary && (
					<Text wrap="truncate" dimColor>
						— {endpoint.summary}
					</Text>
				)}
				{Object.values(endpoint.contentTypes.responseContentTypes)
					.flat()
					.filter((ct) => !ct.includes('json'))
					.filter((ct, i, arr) => arr.indexOf(ct) === i)
					.map((ct) => {
						const fmt = detectContentFormat(ct);
						return (
							<Text key={ct} color={formatBadgeColor(fmt)}>
								[{formatBadgeLabel(fmt)}]
							</Text>
						);
					})}
			</Box>

			{/* View indicator */}
			<Box gap={2} paddingY={1}>
				<Text
					color={activeView === 'request' ? 'cyan' : undefined}
					bold={activeView === 'request'}
				>
					{activeView === 'request' ? '●' : '○'} Request
				</Text>
				<Text
					color={activeView === 'response' ? 'cyan' : undefined}
					bold={activeView === 'response'}
				>
					{activeView === 'response' ? '●' : '○'} Response
				</Text>
			</Box>

			{/* Content area */}
			{activeView === 'request' ? (
				<Box height={panelHeight} width="100%">
					{/* Left panel: field list (~40%) */}
					<Box width="40%">
						<FieldList
							endpoint={endpoint}
							paramValues={paramValues}
							bodyValue={bodyValue}
							selectedIndex={selectedFieldIndex}
							height={panelHeight}
							bodyEditMode={bodyEditMode}
							bodyFieldValues={effectiveBodyFieldValues}
							borderColor={isEditing ? 'gray' : 'cyan'}
							isArrayBody={isArrayBody}
							bodyArrayItems={bodyArrayItems}
							currentBodyItemIndex={currentBodyItemIndex}
							paramArrayItems={paramArrayItems}
							currentParamArrayIndices={currentParamArrayIndices}
							paramArrayRawMode={paramArrayRawMode}
						/>
					</Box>

					{/* Right panel: field editor (~60%) */}
					<Box width="60%">
						{selectedItem ? (
							<FieldEditor
								fieldName={selectedItem.label}
								fieldKind={selectedItem.kind}
								value={selectedItem.value}
								isEditing={isEditing}
								onChange={handleValueChange}
								param={selectedParam}
								bodyField={selectedBodyField}
								bodySchema={
									selectedItem.kind === 'body'
										? endpoint.requestBody
										: undefined
								}
								height={panelHeight}
								borderColor={isEditing ? 'cyan' : 'gray'}
								isArrayBody={isArrayBody}
								currentBodyItemIndex={currentBodyItemIndex}
								totalBodyItems={bodyArrayItems?.length}
								isArrayParam={selectedItem.isArrayParam}
								paramArrayItemIndex={selectedItem.arrayItemIndex}
								paramArrayItemCount={selectedItem.arrayItemCount}
								fileInputMode={selectedFileInputMode}
								useRawEditor={selectedUseRawEditor}
							/>
						) : (
							<Box
								flexDirection="column"
								borderStyle="single"
								borderColor="gray"
								paddingX={1}
								width="100%"
								height={panelHeight}
								overflowY="hidden"
								alignItems="center"
								justifyContent="center"
							>
								<Text dimColor>No fields to edit</Text>
								<Text dimColor>
									Select an endpoint with editable parameters
								</Text>
							</Box>
						)}
					</Box>
				</Box>
			) : (
				<Box height={panelHeight} width="100%">
					<Box width="40%">
						<RequestPreview
							request={sentRequest}
							loading={loading}
							height={panelHeight}
						/>
					</Box>
					<Box width="60%">
						<ResponseView
							response={response}
							loading={loading}
							height={panelHeight}
							saveMode={saveMode}
							onSave={onSave}
							onCancelSave={onCancelSave}
							saveError={saveError}
						/>
					</Box>
				</Box>
			)}
		</Box>
	);
}
