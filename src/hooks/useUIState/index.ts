import { useCallback, useState } from 'react';

export const useUIState = () => {
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
