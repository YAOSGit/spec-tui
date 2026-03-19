import { useContext } from 'react';
import { CommandsContext } from '../../providers/CommandsProvider/index.js';
import type { CommandsContextValue } from '../../providers/CommandsProvider/CommandsProvider.types.js';

export const useCommands = (): CommandsContextValue => {
	const context = useContext(CommandsContext);
	if (!context) {
		throw new Error('useCommands must be used within a CommandsProvider');
	}
	return context;
};
