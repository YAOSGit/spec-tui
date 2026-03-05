import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useNavigationState } from '../../hooks/useNavigationState/index.js';
import type {
	NavigationContextValue,
	NavigationProviderProps,
} from './NavigationProvider.types.js';

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
	children,
}) => {
	const state = useNavigationState();

	const value: NavigationContextValue = useMemo(
		() => state,
		[
			state.selectedIndex,
			state.setSelectedIndex,
			state.activePane,
			state.setActivePane,
			state.selectedEndpoint,
			state.setSelectedEndpoint,
			state.selectedFieldIndex,
			state.setSelectedFieldIndex,
			state.isEditing,
			state.setIsEditing,
			state.activeView,
			state.setActiveView,
			state.paramValues,
			state.setParamValues,
			state.updateParamValue,
			state.bodyValue,
			state.setBodyValue,
			state.requestHistory,
			state.addHistoryEntry,
			state.bodyEditMode,
			state.setBodyEditMode,
			state.bodyFieldValues,
			state.setBodyFieldValues,
			state.updateBodyFieldValue,
			state.bodyArrayItems,
			state.setBodyArrayItems,
			state.currentBodyItemIndex,
			state.setCurrentBodyItemIndex,
			state.addBodyArrayItem,
			state.removeBodyArrayItem,
			state.updateBodyArrayItemField,
			state.paramArrayItems,
			state.setParamArrayItems,
			state.currentParamArrayIndices,
			state.setCurrentParamArrayIndices,
			state.addParamArrayItem,
			state.removeParamArrayItem,
			state.updateParamArrayItem,
			state.setParamArrayIndex,
			state.paramArrayRawMode,
			state.setParamArrayRawMode,
			state.toggleParamArrayRawMode,
			state.fileInputMode,
			state.setFileInputMode,
			state.toggleFileInputMode,
			state.fieldEditorOverride,
			state.setFieldEditorOverride,
			state.toggleFieldEditorOverride,
		],
	);

	return (
		<NavigationContext.Provider value={value}>
			{children}
		</NavigationContext.Provider>
	);
};

export const useNavigation = (): NavigationContextValue => {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
};
