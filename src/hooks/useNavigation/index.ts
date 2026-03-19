import { useContext } from 'react';
import { NavigationContext } from '../../providers/NavigationProvider/index.js';
import type { NavigationContextValue } from '../../providers/NavigationProvider/NavigationProvider.types.js';

export const useNavigation = (): NavigationContextValue => {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
};
