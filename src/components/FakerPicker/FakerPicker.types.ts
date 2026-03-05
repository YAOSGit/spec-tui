import type { FakerCategory } from '../../utils/faker/faker.consts.js';

export interface FakerPickerProps {
	onSelect: (category: FakerCategory) => void;
	onCancel: () => void;
}
