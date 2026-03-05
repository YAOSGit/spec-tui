import { useApp } from 'ink';
import { useCallback } from 'react';
import { AppContent } from './app.js';
import { AppProviders } from './providers.js';

export interface AppProps {
	specSource: string;
	baseUrl?: string;
}

export default function App({ specSource, baseUrl }: AppProps) {
	const { exit } = useApp();

	const handleQuit = useCallback(() => {
		exit();
		setTimeout(() => process.exit(0), 100);
	}, [exit]);

	return (
		<AppProviders
			specSource={specSource}
			baseUrl={baseUrl}
			onQuit={handleQuit}
		>
			<AppContent />
		</AppProviders>
	);
}
