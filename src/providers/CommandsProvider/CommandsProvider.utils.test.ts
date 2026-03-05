import type { Key } from 'ink';
import { describe, expect, it } from 'vitest';
import type { KeyBinding } from '../../types/KeyBinding/index.js';
import { isKeyMatch } from './CommandsProvider.utils.js';

/**
 * Helper: build an Ink Key object where every flag defaults to false.
 */
function makeKey(overrides: Partial<Key> = {}): Key {
	return {
		upArrow: false,
		downArrow: false,
		leftArrow: false,
		rightArrow: false,
		return: false,
		escape: false,
		tab: false,
		backspace: false,
		delete: false,
		pageUp: false,
		pageDown: false,
		home: false,
		end: false,
		ctrl: false,
		shift: false,
		meta: false,
		super: false,
		hyper: false,
		capsLock: false,
		numLock: false,
		...overrides,
	};
}

describe('isKeyMatch', () => {
	// ---- textKey matching ----

	describe('textKey bindings', () => {
		it('matches a lowercase textKey binding', () => {
			const bindings: KeyBinding[] = [{ textKey: 'g' }];
			expect(isKeyMatch(makeKey(), 'g', bindings)).toBe(true);
		});

		it('matches textKey case-insensitively (input uppercase, binding lowercase)', () => {
			const bindings: KeyBinding[] = [{ textKey: 'g' }];
			expect(isKeyMatch(makeKey(), 'G', bindings)).toBe(true);
		});

		it('matches textKey case-insensitively (input lowercase, binding uppercase)', () => {
			const bindings: KeyBinding[] = [{ textKey: 'G' }];
			expect(isKeyMatch(makeKey(), 'g', bindings)).toBe(true);
		});

		it('does not match a different textKey', () => {
			const bindings: KeyBinding[] = [{ textKey: 'g' }];
			expect(isKeyMatch(makeKey(), 'x', bindings)).toBe(false);
		});
	});

	// ---- modifier checks ----

	describe('ctrl modifier', () => {
		it('does not match when ctrl modifier differs (binding requires ctrl, key has none)', () => {
			const bindings: KeyBinding[] = [{ textKey: 'c', ctrl: true }];
			expect(isKeyMatch(makeKey({ ctrl: false }), 'c', bindings)).toBe(false);
		});

		it('does not match when ctrl modifier differs (binding forbids ctrl, key has ctrl)', () => {
			const bindings: KeyBinding[] = [{ textKey: 'c', ctrl: false }];
			expect(isKeyMatch(makeKey({ ctrl: true }), 'c', bindings)).toBe(false);
		});

		it('matches when ctrl modifier agrees', () => {
			const bindings: KeyBinding[] = [{ textKey: 'c', ctrl: true }];
			expect(isKeyMatch(makeKey({ ctrl: true }), 'c', bindings)).toBe(true);
		});
	});

	describe('shift modifier', () => {
		it('does not match when shift modifier differs', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a', shift: true }];
			expect(isKeyMatch(makeKey({ shift: false }), 'a', bindings)).toBe(false);
		});

		it('matches when shift modifier agrees', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a', shift: true }];
			expect(isKeyMatch(makeKey({ shift: true }), 'a', bindings)).toBe(true);
		});
	});

	describe('meta modifier', () => {
		it('does not match when meta modifier differs', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a', meta: true }];
			expect(isKeyMatch(makeKey({ meta: false }), 'a', bindings)).toBe(false);
		});

		it('matches when meta modifier agrees', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a', meta: true }];
			expect(isKeyMatch(makeKey({ meta: true }), 'a', bindings)).toBe(true);
		});
	});

	// ---- specialKey matching ----

	describe('specialKey bindings', () => {
		const specialKeyMap: [string, keyof Key][] = [
			['up', 'upArrow'],
			['down', 'downArrow'],
			['left', 'leftArrow'],
			['right', 'rightArrow'],
			['enter', 'return'],
			['esc', 'escape'],
			['tab', 'tab'],
			['backspace', 'backspace'],
			['delete', 'delete'],
			['pageup', 'pageUp'],
			['pagedown', 'pageDown'],
		];

		for (const [specialKey, inkKeyProp] of specialKeyMap) {
			it(`matches specialKey '${specialKey}' when key.${inkKeyProp} is true`, () => {
				const bindings: KeyBinding[] = [{ specialKey }];
				const key = makeKey({ [inkKeyProp]: true });
				expect(isKeyMatch(key, '', bindings)).toBe(true);
			});

			it(`does not match specialKey '${specialKey}' when key.${inkKeyProp} is false`, () => {
				const bindings: KeyBinding[] = [{ specialKey }];
				expect(isKeyMatch(makeKey(), '', bindings)).toBe(false);
			});
		}

		it('returns false for an unknown specialKey', () => {
			const bindings: KeyBinding[] = [{ specialKey: 'f12' }];
			// Even with all possible key flags set to true, unknown specialKey should fail.
			const key = makeKey({
				upArrow: true,
				downArrow: true,
				leftArrow: true,
				rightArrow: true,
				return: true,
				escape: true,
				tab: true,
				backspace: true,
				delete: true,
				pageUp: true,
				pageDown: true,
			});
			expect(isKeyMatch(key, '', bindings)).toBe(false);
		});
	});

	// ---- OR semantics across multiple bindings ----

	describe('OR semantics (any binding matches)', () => {
		it('returns true when the first binding in the array matches', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a' }, { textKey: 'b' }];
			expect(isKeyMatch(makeKey(), 'a', bindings)).toBe(true);
		});

		it('returns true when the second binding in the array matches', () => {
			const bindings: KeyBinding[] = [{ textKey: 'a' }, { textKey: 'b' }];
			expect(isKeyMatch(makeKey(), 'b', bindings)).toBe(true);
		});

		it('returns true when a specialKey binding matches alongside a non-matching textKey binding', () => {
			const bindings: KeyBinding[] = [
				{ textKey: 'z' },
				{ specialKey: 'enter' },
			];
			const key = makeKey({ return: true });
			expect(isKeyMatch(key, '', bindings)).toBe(true);
		});

		it('returns false when no binding in the array matches', () => {
			const bindings: KeyBinding[] = [
				{ textKey: 'a' },
				{ specialKey: 'enter' },
			];
			expect(isKeyMatch(makeKey(), 'x', bindings)).toBe(false);
		});
	});

	// ---- edge cases ----

	describe('edge cases', () => {
		it('returns false for an empty bindings array', () => {
			expect(isKeyMatch(makeKey(), 'a', [])).toBe(false);
		});

		it('returns false for a binding with no textKey and no specialKey', () => {
			const bindings: KeyBinding[] = [{}];
			expect(isKeyMatch(makeKey(), 'a', bindings)).toBe(false);
		});
	});
});
