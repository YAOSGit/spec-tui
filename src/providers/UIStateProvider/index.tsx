import type React from 'react';
import { createContext, useMemo } from 'react';
import { useUIState } from '../../hooks/useUIState/index.js';
import type {
	UIStateContextValue,
	UIStateProviderProps,
} from './UIStateProvider.types.js';

export const UIStateContext = createContext<UIStateContextValue | null>(null);

export const UIStateProvider: React.FC<UIStateProviderProps> = ({
	children,
}) => {
	const state = useUIState();

	const value: UIStateContextValue = useMemo(() => state, [state]);

	return (
		<UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>
	);
};

export { useUI } from '../../hooks/useUI/index.js';
