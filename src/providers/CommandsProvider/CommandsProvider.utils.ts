import type { Key } from 'ink';
import type { KeyBinding } from '../../types/KeyBinding/index.js';

export const isKeyMatch = (
	key: Key,
	input: string,
	bindings: KeyBinding[],
): boolean => {
	return bindings.some((binding) => {
		if (binding.ctrl !== undefined && key.ctrl !== binding.ctrl) return false;
		if (binding.shift !== undefined && key.shift !== binding.shift)
			return false;
		if (binding.meta !== undefined && key.meta !== binding.meta) return false;

		if (binding.textKey) {
			return binding.textKey.toLocaleLowerCase() === input.toLocaleLowerCase();
		}

		if (binding.specialKey) {
			switch (binding.specialKey) {
				case 'up':
					return key.upArrow;
				case 'down':
					return key.downArrow;
				case 'left':
					return key.leftArrow;
				case 'right':
					return key.rightArrow;
				case 'enter':
					return key.return;
				case 'esc':
					return key.escape;
				case 'tab':
					return key.tab;
				case 'backspace':
					return key.backspace;
				case 'delete':
					return key.delete;
				case 'pageup':
					return key.pageUp;
				case 'pagedown':
					return key.pageDown;
				default:
					return false;
			}
		}

		return false;
	});
};
