import * as fs from 'node:fs';
import { Box, Text, useInput, useStdout } from 'ink';
import { useCallback, useEffect, useState } from 'react';
import { ConfigScreen } from '../components/ConfigScreen/index.js';
import { EndpointDetail } from '../components/EndpointDetail/index.js';
import { EndpointNavigator } from '../components/EndpointNavigator/index.js';
import { FakerPicker } from '../components/FakerPicker/index.js';
import type { ContextHint } from '../components/Footer/Footer.types.js';
import { Footer } from '../components/Footer/index.js';
import { HelpMenu } from '../components/HelpMenu/index.js';
import { NavigatorSidePanel } from '../components/NavigatorSidePanel/index.js';
import { StatusBar } from '../components/StatusBar/index.js';
import { useCommands } from '../providers/CommandsProvider/index.js';
import { useNavigation } from '../providers/NavigationProvider/index.js';
import { useRequestConfig } from '../providers/RequestConfigProvider/index.js';
import { useSpec } from '../providers/SpecProvider/index.js';
import { useUI } from '../providers/UIStateProvider/index.js';
import type { ResponseData } from '../types/ResponseData/index.js';
import {
	buildMultipartBody,
	extractBodySchemaFields,
	hasFileFields,
	isArrayBody,
	isMultipartEndpoint,
	serializeBodyArrayFields,
	serializeBodyFields,
} from '../utils/bodySchema/index.js';
import type { FakerCategory } from '../utils/faker/faker.consts.js';
import { generateValue } from '../utils/faker/index.js';
import { buildRequestHeaders } from '../utils/headers/index.js';
import { buildUrl, executeRequest } from '../utils/request/index.js';

export type SentRequest = {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: unknown;
};

export function AppContent() {
	const { endpoints, specTitle, baseUrl, securitySchemes, loading, error } =
		useSpec();
	const nav = useNavigation();
	const commands = useCommands();
	const ui = useUI();
	const {
		globalHeaders,
		addHeader,
		removeHeader,
		updateHeader,
		authConfig,
		setAuthConfig,
	} = useRequestConfig();
	const [response, setResponse] = useState<ResponseData | null>(null);
	const [requestLoading, setRequestLoading] = useState(false);
	const [sentRequest, setSentRequest] = useState<SentRequest | null>(null);

	const { stdout } = useStdout();
	const [termRows, setTermRows] = useState(stdout?.rows ?? 24);
	useEffect(() => {
		if (!stdout) return;
		const onResize = () => setTermRows(stdout.rows);
		stdout.on('resize', onResize);
		return () => {
			stdout.off('resize', onResize);
		};
	}, [stdout]);

	// Chrome: outer border (2) + statusbar border (3) + footer border (3) = 8
	const contentHeight = Math.max(termRows - 8, 4);

	const handleFakerSelect = useCallback(
		(category: FakerCategory) => {
			const endpoint = nav.selectedEndpoint;
			if (!endpoint) {
				ui.closeFakerPicker();
				return;
			}

			const idx = nav.selectedFieldIndex;
			const totalParams = endpoint.parameters.length;

			if (idx < totalParams) {
				const param = endpoint.parameters[idx];
				if (param) {
					if (param.schema?.type === 'array') {
						const itemSchema = param.schema.items as
							| Record<string, unknown>
							| undefined;
						const value = generateValue(category, itemSchema);
						if (nav.paramArrayRawMode[param.name]) {
							const existing = nav.paramValues[param.name] ?? '';
							nav.updateParamValue(
								param.name,
								existing ? `${existing}, ${value}` : value,
							);
						} else {
							nav.updateParamArrayItem(param.name, value);
						}
					} else {
						const value = generateValue(category, param.schema);
						nav.updateParamValue(param.name, value);
					}
				}
			} else if (endpoint.requestBody) {
				if (nav.bodyEditMode === 'form') {
					const fields = extractBodySchemaFields(endpoint.requestBody);
					const bodyFieldIdx = idx - totalParams;
					const field = fields[bodyFieldIdx];
					if (field) {
						const value = generateValue(category, field.schema);
						if (isArrayBody(endpoint.requestBody)) {
							nav.updateBodyArrayItemField(field.name, value);
						} else {
							nav.updateBodyFieldValue(field.name, value);
						}
					}
				} else {
					const value = generateValue(category);
					nav.setBodyValue(value);
				}
			}

			ui.closeFakerPicker();
		},
		[nav, ui],
	);

	const [saveError, setSaveError] = useState<string | null>(null);

	const handleSaveResponse = useCallback(
		(filePath: string) => {
			if (!response) return;
			const data =
				response.rawBuffer ??
				(typeof response.body === 'string'
					? response.body
					: JSON.stringify(response.body, null, 2));
			try {
				fs.writeFileSync(filePath, data);
				setSaveError(null);
				ui.setSaveMode(false);
			} catch (err) {
				setSaveError(err instanceof Error ? err.message : String(err));
			}
		},
		[response, ui],
	);

	useInput((input, key) => {
		if (ui.showFakerPicker || ui.saveMode || nav.activePane === 'config')
			return;

		if (
			input === 's' &&
			nav.activePane === 'detail' &&
			nav.selectedEndpoint &&
			!nav.isEditing &&
			!requestLoading
		) {
			const endpoint = nav.selectedEndpoint;
			setRequestLoading(true);
			setResponse(null);

			const pathParams: Record<string, string> = {};
			const queryParams: Record<string, string | string[]> = {};
			for (const param of endpoint.parameters) {
				if (param.schema?.type === 'array') {
					const isRaw = nav.paramArrayRawMode[param.name] ?? false;
					const items = isRaw
						? (nav.paramValues[param.name] ?? '')
								.split(',')
								.map((s) => s.trim())
								.filter((s) => s !== '')
						: (nav.paramArrayItems[param.name] ?? ['']).filter((s) => s !== '');
					if (param.location === 'path')
						pathParams[param.name] = items.join(',');
					if (param.location === 'query' && items.length > 0) {
						queryParams[param.name] = items;
					}
				} else {
					const val = nav.paramValues[param.name] ?? '';
					if (param.location === 'path') pathParams[param.name] = val;
					if (param.location === 'query' && val) {
						queryParams[param.name] = val;
					}
				}
			}

			const headers = buildRequestHeaders(
				nav.paramValues,
				endpoint.parameters,
				globalHeaders,
				authConfig,
			);

			// Build body: use form fields in form mode, raw JSON otherwise
			let body: unknown;
			let extraHeaders: Record<string, string> = {};
			if (nav.bodyEditMode === 'form' && endpoint.requestBody) {
				const fields = extractBodySchemaFields(endpoint.requestBody);
				if (fields.length > 0) {
					if (isMultipartEndpoint(endpoint) && hasFileFields(fields)) {
						const form = buildMultipartBody(fields, nav.bodyFieldValues);
						body = form;
						extraHeaders = form.getHeaders();
					} else {
						const json = isArrayBody(endpoint.requestBody)
							? serializeBodyArrayFields(fields, nav.bodyArrayItems)
							: serializeBodyFields(fields, nav.bodyFieldValues);
						try {
							body = JSON.parse(json);
						} catch {
							body = undefined;
						}
					}
				}
			} else if (nav.bodyValue) {
				try {
					body = JSON.parse(nav.bodyValue);
				} catch {
					body = undefined;
				}
			}

			const mergedHeaders = { ...headers, ...extraHeaders };
			const resolvedUrl = buildUrl(
				baseUrl,
				endpoint.path,
				pathParams,
				queryParams,
			);
			const isFormData =
				typeof body === 'object' && body !== null && 'getHeaders' in body;
			setSentRequest({
				method: endpoint.method.toUpperCase(),
				url: resolvedUrl,
				headers: mergedHeaders,
				body: isFormData ? '[multipart/form-data]' : body,
			});

			executeRequest(baseUrl, {
				method: endpoint.method,
				url: endpoint.path,
				headers: mergedHeaders,
				pathParams,
				queryParams,
				body,
			})
				.then((res) => {
					setResponse(res);
					setRequestLoading(false);
					nav.addHistoryEntry({
						id: crypto.randomUUID(),
						method: endpoint.method,
						url: endpoint.path,
						response: res,
					});
				})
				.catch(() => {
					setRequestLoading(false);
				});
			return;
		}

		commands.handleInput(input, key);
	});

	if (loading) {
		return (
			<Box>
				<Text>Loading spec...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box>
				<Text color="red">Error: {error}</Text>
			</Box>
		);
	}

	if (ui.showHelp) {
		return (
			<Box flexDirection="column" borderStyle="round" borderColor="blue">
				<HelpMenu onClose={ui.closeHelp} />
			</Box>
		);
	}

	if (ui.showFakerPicker) {
		return (
			<Box flexDirection="column" borderStyle="round" borderColor="blue">
				<FakerPicker
					onSelect={handleFakerSelect}
					onCancel={ui.closeFakerPicker}
				/>
			</Box>
		);
	}

	const visibleCommands = commands.getVisibleCommands();

	const contextHints: ContextHint[] = [];
	if (nav.isEditing && nav.selectedEndpoint) {
		const endpoint = nav.selectedEndpoint;
		const idx = nav.selectedFieldIndex;
		const paramCount = endpoint.parameters.length;

		if (idx < paramCount) {
			const param = endpoint.parameters[idx];
			if (param?.schema?.type === 'boolean') {
				contextHints.push({ displayKey: '← →', displayText: 'cycle' });
			} else if (param?.schema?.type === 'integer') {
				contextHints.push({ displayKey: '↑ ↓', displayText: 'step' });
			}
		} else if (endpoint.requestBody && nav.bodyEditMode === 'form') {
			const fields = extractBodySchemaFields(endpoint.requestBody);
			const field = fields[idx - paramCount];
			if (field?.type === 'file') {
				const mode = nav.fileInputMode[field.name] ?? 'browser';
				if (mode === 'browser') {
					contextHints.push(
						{ displayKey: '↑ ↓', displayText: 'navigate' },
						{ displayKey: 'Enter', displayText: 'select' },
						{ displayKey: 'Bksp', displayText: 'up dir' },
					);
				}
			} else if (field?.type === 'boolean') {
				contextHints.push({ displayKey: '← →', displayText: 'cycle' });
			} else if (field?.type === 'integer') {
				contextHints.push({ displayKey: '↑ ↓', displayText: 'step' });
			}
		}
	}

	// Config view — full-screen page
	if (nav.activePane === 'config') {
		return (
			<Box flexDirection="column" borderStyle="round" borderColor="blue">
				<StatusBar
					specTitle={specTitle}
					activePane={nav.activePane}
					selectedEndpoint={nav.selectedEndpoint}
					activeView={nav.activeView}
				/>
				<ConfigScreen
					headers={globalHeaders}
					onAddHeader={addHeader}
					onRemoveHeader={removeHeader}
					onUpdateHeader={updateHeader}
					authConfig={authConfig}
					onAuthChange={setAuthConfig}
					securitySchemes={securitySchemes}
					onClose={() => nav.setActivePane('navigator')}
				/>
				<Footer commands={visibleCommands} />
			</Box>
		);
	}

	// Detail view — full-screen page
	if (nav.activePane === 'detail' && nav.selectedEndpoint) {
		return (
			<Box flexDirection="column" borderStyle="round" borderColor="blue">
				<StatusBar
					specTitle={specTitle}
					activePane={nav.activePane}
					selectedEndpoint={nav.selectedEndpoint}
					activeView={nav.activeView}
				/>
				<EndpointDetail
					endpoint={nav.selectedEndpoint}
					paramValues={nav.paramValues}
					bodyValue={nav.bodyValue}
					selectedFieldIndex={nav.selectedFieldIndex}
					isEditing={nav.isEditing}
					activeView={nav.activeView}
					onParamChange={nav.updateParamValue}
					onBodyChange={nav.setBodyValue}
					response={response}
					sentRequest={sentRequest}
					loading={requestLoading}
					height={contentHeight}
					bodyEditMode={nav.bodyEditMode}
					bodyFieldValues={nav.bodyFieldValues}
					onBodyFieldChange={nav.updateBodyFieldValue}
					isArrayBody={
						nav.selectedEndpoint.requestBody
							? isArrayBody(nav.selectedEndpoint.requestBody)
							: false
					}
					bodyArrayItems={nav.bodyArrayItems}
					currentBodyItemIndex={nav.currentBodyItemIndex}
					onBodyArrayFieldChange={nav.updateBodyArrayItemField}
					paramArrayItems={nav.paramArrayItems}
					currentParamArrayIndices={nav.currentParamArrayIndices}
					onParamArrayChange={nav.updateParamArrayItem}
					paramArrayRawMode={nav.paramArrayRawMode}
					fileInputMode={nav.fileInputMode}
					fieldEditorOverride={nav.fieldEditorOverride}
					saveMode={ui.saveMode}
					onSave={handleSaveResponse}
					onCancelSave={() => {
						ui.setSaveMode(false);
						setSaveError(null);
					}}
					saveError={saveError}
				/>
				<Footer commands={visibleCommands} contextHints={contextHints} />
			</Box>
		);
	}

	// Navigator view — main screen with side panel
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue">
			<StatusBar
				specTitle={specTitle}
				activePane={nav.activePane}
				selectedEndpoint={nav.selectedEndpoint}
				activeView={nav.activeView}
			/>
			<Box>
				<EndpointNavigator
					endpoints={endpoints}
					selectedIndex={nav.selectedIndex}
					height={contentHeight}
				/>
				<NavigatorSidePanel
					baseUrl={baseUrl}
					securitySchemes={securitySchemes}
					endpointCount={endpoints.length}
					selectedEndpoint={endpoints[nav.selectedIndex] ?? null}
					requestHistory={nav.requestHistory}
					height={contentHeight}
				/>
			</Box>
			<Footer commands={visibleCommands} />
		</Box>
	);
}
