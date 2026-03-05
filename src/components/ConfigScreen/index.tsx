import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import type { AuthConfig, AuthType } from '../../types/AuthConfig/index.js';
import type { SecurityScheme } from '../../types/SecurityScheme/index.js';
import type { ConfigScreenProps } from './ConfigScreen.types.js';

type Section = 'auth' | 'headers';
type HeaderEditField = 'key' | 'value';

interface AuthPreset {
	type: AuthType;
	label: string;
	fromSpec: boolean;
}

function buildPresets(schemes: SecurityScheme[]): AuthPreset[] {
	const presets: AuthPreset[] = [
		{ type: 'none', label: 'None', fromSpec: false },
	];
	const seen = new Set<AuthType>(['none']);

	for (const scheme of schemes) {
		if (
			scheme.type === 'http' &&
			scheme.scheme === 'bearer' &&
			!seen.has('bearer')
		) {
			presets.push({ type: 'bearer', label: 'Bearer Token', fromSpec: true });
			seen.add('bearer');
		}
		if (
			scheme.type === 'http' &&
			scheme.scheme === 'basic' &&
			!seen.has('basic')
		) {
			presets.push({ type: 'basic', label: 'Basic Auth', fromSpec: true });
			seen.add('basic');
		}
		if (scheme.type === 'apiKey' && !seen.has('apiKey')) {
			presets.push({
				type: 'apiKey',
				label: `API Key (${scheme.name ?? 'key'})`,
				fromSpec: true,
			});
			seen.add('apiKey');
		}
	}

	if (!seen.has('bearer'))
		presets.push({ type: 'bearer', label: 'Bearer Token', fromSpec: false });
	if (!seen.has('basic'))
		presets.push({ type: 'basic', label: 'Basic Auth', fromSpec: false });
	if (!seen.has('apiKey'))
		presets.push({ type: 'apiKey', label: 'API Key', fromSpec: false });

	return presets;
}

export function ConfigScreen({
	headers,
	onAddHeader,
	onRemoveHeader,
	authConfig,
	onAuthChange,
	securitySchemes,
	onClose,
}: ConfigScreenProps) {
	const [section, setSection] = useState<Section>('auth');

	// --- Auth state ---
	const presets = buildPresets(securitySchemes);
	const [selectedPreset, setSelectedPreset] = useState(() =>
		Math.max(
			0,
			presets.findIndex((p) => p.type === authConfig.type),
		),
	);
	const [editingAuth, setEditingAuth] = useState(false);
	const [authField, setAuthField] = useState(0);
	const [token, setToken] = useState(authConfig.bearer?.token ?? '');
	const [username, setUsername] = useState(authConfig.basic?.username ?? '');
	const [password, setPassword] = useState(authConfig.basic?.password ?? '');
	const [apiKeyName, setApiKeyName] = useState(() => {
		if (authConfig.apiKey?.name) return authConfig.apiKey.name;
		const specApiKey = securitySchemes.find((s) => s.type === 'apiKey');
		return specApiKey?.name ?? 'X-API-Key';
	});
	const [apiKeyValue, setApiKeyValue] = useState(
		authConfig.apiKey?.value ?? '',
	);

	// --- Headers state ---
	const headerEntries = Object.entries(headers);
	const [headerRow, setHeaderRow] = useState(0);
	const [isAddingHeader, setIsAddingHeader] = useState(false);
	const [headerEditField, setHeaderEditField] =
		useState<HeaderEditField>('key');
	const [newHeaderKey, setNewHeaderKey] = useState('');
	const [newHeaderValue, setNewHeaderValue] = useState('');

	const activePreset = presets[selectedPreset];

	const applyAuth = () => {
		const type = activePreset?.type ?? 'none';
		let config: AuthConfig;
		switch (type) {
			case 'bearer':
				config = { type: 'bearer', bearer: { token } };
				break;
			case 'basic':
				config = { type: 'basic', basic: { username, password } };
				break;
			case 'apiKey':
				config = {
					type: 'apiKey',
					apiKey: {
						name: apiKeyName,
						value: apiKeyValue,
						location: 'header',
					},
				};
				break;
			default:
				config = { type: 'none' };
		}
		onAuthChange(config);
	};

	useInput((input, key) => {
		// --- Adding header mode ---
		if (isAddingHeader) {
			if (key.escape) {
				setIsAddingHeader(false);
				setNewHeaderKey('');
				setNewHeaderValue('');
				return;
			}
			if (key.return) {
				if (headerEditField === 'key' && newHeaderKey) {
					setHeaderEditField('value');
					return;
				}
				if (headerEditField === 'value' && newHeaderKey) {
					onAddHeader(newHeaderKey, newHeaderValue);
					setIsAddingHeader(false);
					setNewHeaderKey('');
					setNewHeaderValue('');
					setHeaderEditField('key');
					setHeaderRow(headerEntries.length);
					return;
				}
			}
			if (key.tab) {
				setHeaderEditField((prev) =>
					prev === 'key' ? 'value' : 'key',
				);
				return;
			}
			return;
		}

		// --- Editing auth credentials mode ---
		if (editingAuth) {
			if (key.escape) {
				applyAuth();
				setEditingAuth(false);
				return;
			}
			if (key.tab) {
				const maxFields =
					activePreset?.type === 'basic' ||
					activePreset?.type === 'apiKey'
						? 2
						: 1;
				setAuthField((prev) => (prev + 1) % maxFields);
				return;
			}
			if (key.return) {
				applyAuth();
				setEditingAuth(false);
				return;
			}
			return;
		}

		// --- Global keys ---
		if (key.escape) {
			onClose();
			return;
		}

		// Switch sections with Tab
		if (key.tab) {
			setSection((prev) => (prev === 'auth' ? 'headers' : 'auth'));
			return;
		}

		// --- Auth section ---
		if (section === 'auth') {
			if (key.upArrow && selectedPreset > 0) {
				setSelectedPreset(selectedPreset - 1);
			}
			if (key.downArrow && selectedPreset < presets.length - 1) {
				setSelectedPreset(selectedPreset + 1);
			}
			if (key.return) {
				const type = presets[selectedPreset]?.type ?? 'none';
				if (type === 'none') {
					onAuthChange({ type: 'none' });
					return;
				}
				setEditingAuth(true);
				setAuthField(0);
			}
		}

		// --- Headers section ---
		if (section === 'headers') {
			if (input === 'n') {
				setIsAddingHeader(true);
				setHeaderEditField('key');
				return;
			}
			if (input === 'd' && headerEntries.length > 0) {
				const keyToRemove = headerEntries[headerRow]?.[0];
				if (keyToRemove) {
					onRemoveHeader(keyToRemove);
					setHeaderRow(Math.max(0, headerRow - 1));
				}
				return;
			}
			if (key.upArrow && headerRow > 0) {
				setHeaderRow(headerRow - 1);
			}
			if (key.downArrow && headerRow < headerEntries.length - 1) {
				setHeaderRow(headerRow + 1);
			}
		}
	});

	return (
		<Box flexDirection="column" paddingX={1}>
			<Box paddingBottom={1}>
				<Text bold color="cyan">
					Configuration
				</Text>
			</Box>

			<Box>
				{/* Left: Auth */}
				<Box flexDirection="column" width="50%">
					<Box paddingBottom={1}>
						<Text bold color={section === 'auth' ? 'magenta' : 'gray'}>
							{section === 'auth' ? '▸ ' : '  '}Authentication
						</Text>
					</Box>

					{presets.map((preset, i) => (
						<Box key={preset.type} gap={1}>
							<Text
								color={
									section === 'auth' && i === selectedPreset
										? 'magenta'
										: 'white'
								}
							>
								{section === 'auth' && i === selectedPreset ? '>' : ' '}
							</Text>
							<Text bold={authConfig.type === preset.type}>
								{preset.label}
							</Text>
							{preset.fromSpec && <Text color="yellow">★</Text>}
							{authConfig.type === preset.type && (
								<Text color="green">(active)</Text>
							)}
						</Box>
					))}

					{editingAuth && activePreset && (
						<Box
							flexDirection="column"
							paddingTop={1}
							borderStyle="single"
							borderColor="gray"
							paddingX={1}
						>
							{activePreset.type === 'bearer' && (
								<Box gap={1}>
									<Text>Token: </Text>
									<TextInput value={token} onChange={setToken} />
								</Box>
							)}
							{activePreset.type === 'basic' && (
								<>
									<Box gap={1}>
										<Text>Username: </Text>
										{authField === 0 ? (
											<TextInput value={username} onChange={setUsername} />
										) : (
											<Text>{username || '(empty)'}</Text>
										)}
									</Box>
									<Box gap={1}>
										<Text>Password: </Text>
										{authField === 1 ? (
											<TextInput value={password} onChange={setPassword} />
										) : (
											<Text>{password ? '••••••' : '(empty)'}</Text>
										)}
									</Box>
								</>
							)}
							{activePreset.type === 'apiKey' && (
								<>
									<Box gap={1}>
										<Text>Name: </Text>
										{authField === 0 ? (
											<TextInput
												value={apiKeyName}
												onChange={setApiKeyName}
											/>
										) : (
											<Text>{apiKeyName || '(empty)'}</Text>
										)}
									</Box>
									<Box gap={1}>
										<Text>Value: </Text>
										{authField === 1 ? (
											<TextInput
												value={apiKeyValue}
												onChange={setApiKeyValue}
											/>
										) : (
											<Text>{apiKeyValue || '(empty)'}</Text>
										)}
									</Box>
								</>
							)}
						</Box>
					)}
				</Box>

				{/* Right: Headers */}
				<Box flexDirection="column" width="50%" paddingLeft={1}>
					<Box paddingBottom={1}>
						<Text bold color={section === 'headers' ? 'cyan' : 'gray'}>
							{section === 'headers' ? '▸ ' : '  '}Global Headers
						</Text>
					</Box>

					{headerEntries.length === 0 && !isAddingHeader && (
						<Text dimColor>(no headers)</Text>
					)}

					{headerEntries.map(([hKey, hValue], i) => (
						<Box key={hKey} gap={1}>
							<Text
								color={
									section === 'headers' && i === headerRow
										? 'cyan'
										: 'white'
								}
							>
								{section === 'headers' && i === headerRow ? '>' : ' '}
							</Text>
							<Text bold>{hKey}</Text>
							<Text dimColor>:</Text>
							<Text>{hValue}</Text>
						</Box>
					))}

					{isAddingHeader && (
						<Box gap={1} paddingTop={headerEntries.length > 0 ? 1 : 0}>
							<Text color="green">+</Text>
							{headerEditField === 'key' ? (
								<TextInput
									value={newHeaderKey}
									onChange={setNewHeaderKey}
									placeholder="Header-Name"
								/>
							) : (
								<>
									<Text bold>{newHeaderKey}</Text>
									<Text dimColor>:</Text>
									<TextInput
										value={newHeaderValue}
										onChange={setNewHeaderValue}
										placeholder="value"
									/>
								</>
							)}
						</Box>
					)}
				</Box>
			</Box>

		</Box>
	);
}
