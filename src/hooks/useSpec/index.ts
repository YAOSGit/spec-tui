import { useContext } from 'react';
import { SpecContext } from '../../providers/SpecProvider/index.js';
import type { SpecContextValue } from '../../providers/SpecProvider/SpecProvider.types.js';

export const useSpec = (): SpecContextValue => {
	const context = useContext(SpecContext);
	if (!context) {
		throw new Error('useSpec must be used within a SpecProvider');
	}
	return context;
};
