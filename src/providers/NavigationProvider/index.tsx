import type React from 'react';
import { createContext, useMemo } from 'react';
import { useNavigationState } from '../../hooks/useNavigationState/index.js';
import type {
	NavigationContextValue,
	NavigationProviderProps,
} from './NavigationProvider.types.js';

export const NavigationContext = createContext<NavigationContextValue | null>(
	null,
);

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
	children,
}) => {
	const state = useNavigationState();

	const value: NavigationContextValue = useMemo(() => state, [state]);

	return (
		<NavigationContext.Provider value={value}>
			{children}
		</NavigationContext.Provider>
	);
};

export { useNavigation } from '../../hooks/useNavigation/index.js';
