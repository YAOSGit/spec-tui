import { useContext } from 'react';
import type { CommandsContextValue } from '../../providers/CommandsProvider/CommandsProvider.types.js';
import { CommandsContext } from '../../providers/CommandsProvider/index.js';

export const useCommands = (): CommandsContextValue => {
	const context = useContext(CommandsContext);
	if (!context) {
		throw new Error('useCommands must be used within a CommandsProvider');
	}
	return context;
};
