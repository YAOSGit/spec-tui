export type ContentFormat =
	| 'json'
	| 'html'
	| 'xml'
	| 'csv'
	| 'javascript'
	| 'css'
	| 'binary'
	| 'text';

export function detectContentFormat(
	contentTypeHeader?: string,
	body?: string,
): ContentFormat {
	if (contentTypeHeader) {
		const ct = contentTypeHeader.toLowerCase();
		if (ct.includes('json')) return 'json';
		if (ct.includes('html')) return 'html';
		if (ct.includes('xml')) return 'xml';
		if (ct.includes('csv')) return 'csv';
		if (ct.includes('javascript')) return 'javascript';
		if (ct.includes('css')) return 'css';
		if (
			ct.includes('octet-stream') ||
			ct.includes('image/') ||
			ct.includes('audio/') ||
			ct.includes('video/')
		)
			return 'binary';
	}

	// Body sniffing fallback
	if (body) {
		const trimmed = body.trimStart();
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			try {
				JSON.parse(trimmed);
				return 'json';
			} catch {
				// not valid JSON
			}
		}
		if (trimmed.startsWith('<?xml') || trimmed.startsWith('<soap'))
			return 'xml';
		if (/^\s*<!doctype\s/i.test(trimmed) || /^\s*<html[\s>]/i.test(trimmed))
			return 'html';
	}

	return 'text';
}

const BADGE_LABELS: Record<ContentFormat, string> = {
	json: 'JSON',
	html: 'HTML',
	xml: 'XML',
	csv: 'CSV',
	javascript: 'JS',
	css: 'CSS',
	binary: 'BIN',
	text: 'TXT',
};

export function formatBadgeLabel(format: ContentFormat): string {
	return BADGE_LABELS[format];
}

const BADGE_COLORS: Record<ContentFormat, string> = {
	json: 'green',
	html: 'magenta',
	xml: 'cyan',
	csv: 'yellow',
	javascript: 'yellow',
	css: 'blue',
	binary: 'red',
	text: 'gray',
};

export function formatBadgeColor(format: ContentFormat): string {
	return BADGE_COLORS[format];
}
