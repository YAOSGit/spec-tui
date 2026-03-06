export type SentRequest = {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: unknown;
};
