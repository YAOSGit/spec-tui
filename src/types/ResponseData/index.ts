export type ResponseData = {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: unknown;
	/** Raw response bytes for saving to disk */
	rawBuffer?: Buffer;
	/** Time in ms */
	duration: number;
	/** ISO timestamp */
	timestamp: string;
};

export type HistoryEntry = {
	id: string;
	method: string;
	url: string;
	response: ResponseData;
};
