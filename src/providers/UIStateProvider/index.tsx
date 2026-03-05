import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useUIState } from '../../hooks/useUIState/index.js';
import type {
	UIStateContextValue,
	UIStateProviderProps,
} from './UIStateProvider.types.js';

const UIStateContext = createContext<UIStateContextValue | null>(null);

export const UIStateProvider: React.FC<UIStateProviderProps> = ({
	children,
}) => {
	const state = useUIState();

	const value: UIStateContextValue = useMemo(
		() => state,
		[
			state.showHelp,
			state.showFakerPicker,
			state.saveMode,
			state.setSaveMode,
			state.openHelp,
			state.closeHelp,
			state.toggleHelp,
			state.openFakerPicker,
			state.closeFakerPicker,
		],
	);

	return (
		<UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>
	);
};

export const useUI = (): UIStateContextValue => {
	const context = useContext(UIStateContext);
	if (!context) {
		throw new Error('useUI must be used within a UIStateProvider');
	}
	return context;
};
