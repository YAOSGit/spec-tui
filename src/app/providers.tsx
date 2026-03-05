import type React from 'react';
import { CommandsProvider } from '../providers/CommandsProvider/index.js';
import { NavigationProvider } from '../providers/NavigationProvider/index.js';
import { RequestConfigProvider } from '../providers/RequestConfigProvider/index.js';
import { SpecProvider } from '../providers/SpecProvider/index.js';
import { UIStateProvider } from '../providers/UIStateProvider/index.js';

export interface AppProvidersProps {
	specSource: string;
	baseUrl?: string;
	children: React.ReactNode;
	onQuit: () => void;
}

export function AppProviders({
	specSource,
	baseUrl,
	children,
	onQuit,
}: AppProvidersProps) {
	return (
		<SpecProvider specSource={specSource} baseUrlOverride={baseUrl}>
			<NavigationProvider>
				<UIStateProvider>
					<RequestConfigProvider>
						<CommandsProvider onQuit={onQuit}>{children}</CommandsProvider>
					</RequestConfigProvider>
				</UIStateProvider>
			</NavigationProvider>
		</SpecProvider>
	);
}
