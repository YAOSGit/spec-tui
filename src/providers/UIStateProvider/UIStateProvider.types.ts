export interface UIStateContextValue {
	showHelp: boolean;
	showFakerPicker: boolean;
	saveMode: boolean;
	setSaveMode: (mode: boolean) => void;
	openHelp: () => void;
	closeHelp: () => void;
	toggleHelp: () => void;
	openFakerPicker: () => void;
	closeFakerPicker: () => void;
}

export interface UIStateProviderProps {
	children: React.ReactNode;
}
