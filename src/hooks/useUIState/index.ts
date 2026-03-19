import { useCallback, useState } from 'react';
import type { UIStateContextValue } from '../../providers/UIStateProvider/UIStateProvider.types.js';

export const useUIState = (): UIStateContextValue => {
	const [showHelp, setShowHelp] = useState(false);
	const [showFakerPicker, setShowFakerPicker] = useState(false);
	const [saveMode, setSaveMode] = useState(false);
	const openHelp = useCallback(() => setShowHelp(true), []);
	const closeHelp = useCallback(() => setShowHelp(false), []);
	const toggleHelp = useCallback(() => setShowHelp((prev) => !prev), []);
	const openFakerPicker = useCallback(() => setShowFakerPicker(true), []);
	const closeFakerPicker = useCallback(() => setShowFakerPicker(false), []);

	return {
		showHelp,
		showFakerPicker,
		saveMode,
		setSaveMode,
		openHelp,
		closeHelp,
		toggleHelp,
		openFakerPicker,
		closeFakerPicker,
	};
};
