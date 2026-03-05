export const FAKER_CATEGORIES = {
	EMAIL: 'email',
	NAME: 'name',
	URL: 'url',
	UUID: 'uuid',
	PHONE: 'phone',
	DATE: 'date',
	NUMBER: 'number',
	BOOLEAN: 'boolean',
	WORD: 'word',
} as const;

export type FakerCategory =
	(typeof FAKER_CATEGORIES)[keyof typeof FAKER_CATEGORIES];

export const FAKER_CATEGORY_LABELS: Record<FakerCategory, string> = {
	email: 'Email address',
	name: 'Person name',
	url: 'URL',
	uuid: 'UUID',
	phone: 'Phone number',
	date: 'ISO date-time',
	number: 'Integer',
	boolean: 'Boolean',
	word: 'Lorem word',
};
