import { useContext } from 'react';
import { UIStateContext } from '../../providers/UIStateProvider/index.js';
import type { UIStateContextValue } from '../../providers/UIStateProvider/UIStateProvider.types.js';

export const useUI = (): UIStateContextValue => {
	const context = useContext(UIStateContext);
	if (!context) {
		throw new Error('useUI must be used within a UIStateProvider');
	}
	return context;
};
