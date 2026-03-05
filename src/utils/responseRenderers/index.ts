import chalk from 'chalk';
import type { ContentFormat } from '../contentType/index.js';

const INDENT = '  ';

export function renderXml(raw: string): string[] {
	const lines: string[] = [];
	let indent = 0;

	// Split into text and tag tokens
	const tokens = raw.split(/(<[^>]+>)/);

	for (const token of tokens) {
		const trimmed = token.trim();
		if (!trimmed) continue;

		if (trimmed.startsWith('</')) {
			// Closing tag
			indent = Math.max(0, indent - 1);
			const tagName = trimmed.replace(/<\/([^\s>]+)>/, '$1');
			lines.push(
				INDENT.repeat(indent) +
					chalk.gray('</') +
					chalk.cyan(tagName) +
					chalk.gray('>'),
			);
		} else if (trimmed.startsWith('<?')) {
			// Declaration
			lines.push(INDENT.repeat(indent) + chalk.gray(trimmed));
		} else if (trimmed.startsWith('<!')) {
			// DOCTYPE / comment
			lines.push(INDENT.repeat(indent) + chalk.gray(trimmed));
		} else if (trimmed.startsWith('<')) {
			// Opening or self-closing tag
			const selfClosing = trimmed.endsWith('/>');
			const match = trimmed.match(/^<([^\s/>]+)([\s\S]*?)(\/?>)$/);
			if (match) {
				const tagName = match[1]!;
				const attrs = match[2]!;
				const close = match[3]!;

				let attrStr = '';
				if (attrs.trim()) {
					attrStr = attrs.replace(
						/(\w[\w-]*)=(["'])(.*?)\2/g,
						(_m, name: string, _q: string, val: string) =>
							chalk.green(name) + '=' + chalk.yellow(`"${val}"`),
					);
				}

				lines.push(
					INDENT.repeat(indent) +
						chalk.gray('<') +
						chalk.cyan(tagName) +
						attrStr +
						chalk.gray(close),
				);

				if (!selfClosing) indent++;
			} else {
				lines.push(INDENT.repeat(indent) + chalk.gray(trimmed));
				if (!selfClosing) indent++;
			}
		} else {
			// Text content
			const textLines = trimmed.split('\n');
			for (const tl of textLines) {
				const t = tl.trim();
				if (t) lines.push(INDENT.repeat(indent) + chalk.white(t));
			}
		}
	}

	return lines;
}

function parseCsvLine(line: string): string[] {
	const fields: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i]!;
		if (inQuotes) {
			if (ch === '"' && line[i + 1] === '"') {
				current += '"';
				i++;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				current += ch;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
			} else if (ch === ',') {
				fields.push(current);
				current = '';
			} else {
				current += ch;
			}
		}
	}
	fields.push(current);
	return fields;
}

export function renderCsv(raw: string, maxWidth = 120): string[] {
	const csvLines = raw.split('\n').filter((l) => l.trim());
	if (csvLines.length === 0) return [];

	const rows = csvLines.map(parseCsvLine);
	const colCount = Math.max(...rows.map((r) => r.length));

	// Calculate column widths
	const colWidths: number[] = Array.from({ length: colCount }, () => 0);
	for (const row of rows) {
		for (let c = 0; c < colCount; c++) {
			colWidths[c] = Math.max(colWidths[c]!, (row[c] ?? '').length);
		}
	}

	// Cap widths to fit maxWidth
	const separatorWidth = (colCount - 1) * 3; // ' | '
	const available = maxWidth - separatorWidth;
	const maxColWidth = Math.max(Math.floor(available / colCount), 5);
	for (let c = 0; c < colCount; c++) {
		colWidths[c] = Math.min(colWidths[c]!, maxColWidth);
	}

	const lines: string[] = [];
	const separator = chalk.gray(' | ');

	for (let r = 0; r < rows.length; r++) {
		const row = rows[r]!;
		const cells = Array.from({ length: colCount }, (_, c) => {
			const val = (row[c] ?? '').slice(0, colWidths[c]);
			return val.padEnd(colWidths[c]!);
		});

		if (r === 0) {
			lines.push(cells.map((c) => chalk.bold(c)).join(separator));
			// Separator row
			const dashes = colWidths.map((w) => '-'.repeat(w));
			lines.push(chalk.gray(dashes.join('-+-')));
		} else {
			lines.push(cells.join(separator));
		}
	}

	return lines;
}

const JS_KEYWORDS = new Set([
	'const',
	'let',
	'var',
	'function',
	'return',
	'if',
	'else',
	'for',
	'while',
	'class',
	'import',
	'export',
	'async',
	'await',
	'true',
	'false',
	'null',
	'undefined',
	'new',
	'this',
	'switch',
	'case',
	'break',
	'continue',
	'try',
	'catch',
	'throw',
	'typeof',
	'instanceof',
	'default',
	'from',
	'of',
	'in',
	'do',
	'yield',
]);

export function renderJavascript(raw: string): string[] {
	return raw.split('\n').map((line) => {
		// Comments
		if (/^\s*\/\//.test(line)) return chalk.gray(line);
		if (/^\s*\/\*/.test(line)) return chalk.gray(line);
		if (/^\s*\*/.test(line)) return chalk.gray(line);

		let result = line;
		// Strings (single and double quoted)
		result = result.replace(
			/(["'`])(?:(?!\1|\\).|\\.)*\1/g,
			(m) => chalk.green(m),
		);
		// Numbers
		result = result.replace(/\b(\d+\.?\d*)\b/g, (m) => chalk.yellow(m));
		// Keywords
		result = result.replace(/\b(\w+)\b/g, (m) =>
			JS_KEYWORDS.has(m) ? chalk.magenta.bold(m) : m,
		);

		return result;
	});
}

export function renderCss(raw: string): string[] {
	return raw.split('\n').map((line) => {
		// Comments
		if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line))
			return chalk.gray(line);

		// Selectors (lines ending with {)
		if (/\{\s*$/.test(line.trim()))
			return chalk.cyan(line);

		// Property: value lines
		const propMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.+?)(;?\s*)$/);
		if (propMatch) {
			const [, ws, prop, colon, value, semi] = propMatch;
			let coloredValue = value!;
			// Hex colors
			coloredValue = coloredValue.replace(
				/#[0-9a-fA-F]{3,8}\b/g,
				(m) => chalk.yellow(m),
			);
			// Strings
			coloredValue = coloredValue.replace(
				/(["'])(?:(?!\1|\\).|\\.)*\1/g,
				(m) => chalk.green(m),
			);
			// Numbers with units
			coloredValue = coloredValue.replace(
				/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms)?\b/g,
				(_m, n: string, u: string) =>
					chalk.yellow(n) + (u ? chalk.green(u) : ''),
			);
			return ws + chalk.blue(prop) + colon + coloredValue + semi;
		}

		// Closing brace
		if (/^\s*\}/.test(line)) return chalk.gray(line);

		return line;
	});
}

export function renderHexDump(raw: string): string[] {
	const lines: string[] = [];
	const bytes =
		typeof Buffer !== 'undefined'
			? Buffer.from(raw, 'utf-8')
			: new TextEncoder().encode(raw);

	for (let offset = 0; offset < bytes.length; offset += 16) {
		const chunk = bytes.slice(offset, offset + 16);

		// Offset
		const offsetStr = chalk.gray(
			offset.toString(16).padStart(8, '0') + ':',
		);

		// Hex bytes in pairs
		const hexPairs: string[] = [];
		for (let i = 0; i < 16; i += 2) {
			const b0 = i < chunk.length ? chunk[i]!.toString(16).padStart(2, '0') : '  ';
			const b1 =
				i + 1 < chunk.length
					? chunk[i + 1]!.toString(16).padStart(2, '0')
					: '  ';
			hexPairs.push(b0 + b1);
		}
		const hexStr = chalk.cyan(hexPairs.join(' '));

		// ASCII
		let ascii = '';
		for (let i = 0; i < 16; i++) {
			if (i < chunk.length) {
				const b = chunk[i]!;
				ascii +=
					b >= 0x20 && b <= 0x7e
						? chalk.green(String.fromCharCode(b))
						: chalk.gray('.');
			}
		}

		lines.push(`${offsetStr} ${hexStr}  ${ascii}`);
	}

	return lines;
}

export function renderResponseBody(
	format: ContentFormat,
	raw: string,
	maxWidth?: number,
): string[] {
	switch (format) {
		case 'xml':
			return renderXml(raw);
		case 'html':
			return renderXml(raw);
		case 'csv':
			return renderCsv(raw, maxWidth);
		case 'javascript':
			return renderJavascript(raw);
		case 'css':
			return renderCss(raw);
		case 'binary':
			return renderHexDump(raw);
		case 'json':
		case 'text':
		default:
			return raw.split('\n');
	}
}
