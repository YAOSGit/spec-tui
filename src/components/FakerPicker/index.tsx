import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import {
	FAKER_CATEGORIES,
	FAKER_CATEGORY_LABELS,
	type FakerCategory,
} from '../../utils/faker/faker.consts.js';
import type { FakerPickerProps } from './FakerPicker.types.js';

const items = Object.values(FAKER_CATEGORIES).map((cat) => ({
	label: FAKER_CATEGORY_LABELS[cat],
	value: cat,
}));

export function FakerPicker({ onSelect, onCancel }: FakerPickerProps) {
	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="magenta"
			paddingX={1}
		>
			<Text bold color="magenta">
				Generate as:
			</Text>
			<SelectInput
				items={items}
				onSelect={(item) => onSelect(item.value as FakerCategory)}
			/>
		</Box>
	);
}
