import { describe, it, expect } from 'vitest';
import chalk from 'chalk';
import {
	renderXml,
	renderCsv,
	renderJavascript,
	renderCss,
	renderHexDump,
	renderResponseBody,
} from './index.js';

// Force chalk colors for consistent test output
chalk.level = 1;

describe('renderXml', () => {
	it('produces indented lines for nested tags', () => {
		const xml = '<root><child>text</child></root>';
		const lines = renderXml(xml);
		expect(lines.length).toBeGreaterThanOrEqual(4);
		// Opening root, opening child, text, closing child, closing root
	});

	it('handles self-closing tags without increasing indent', () => {
		const xml = '<root><br/></root>';
		const lines = renderXml(xml);
		// self-closing br should not increase indent for closing root
		const closingRoot = lines.find((l) => l.includes('root') && l.includes('</'));
		expect(closingRoot).toBeDefined();
	});

	it('handles XML declarations', () => {
		const xml = '<?xml version="1.0"?><root/>';
		const lines = renderXml(xml);
		expect(lines.length).toBeGreaterThanOrEqual(2);
	});

	it('handles DOCTYPE', () => {
		const xml = '<!DOCTYPE html><html><body/></html>';
		const lines = renderXml(xml);
		expect(lines.length).toBeGreaterThanOrEqual(2);
	});
});

describe('renderCsv', () => {
	it('renders header + separator + data rows', () => {
		const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
		const lines = renderCsv(csv);
		expect(lines.length).toBe(4); // header, separator, 2 data rows
	});

	it('handles quoted fields with commas', () => {
		const csv = 'name,description\nAlice,"Hello, World"\nBob,"Foo, Bar"';
		const lines = renderCsv(csv);
		expect(lines.length).toBe(4);
	});

	it('returns empty for empty input', () => {
		expect(renderCsv('')).toEqual([]);
	});
});

describe('renderJavascript', () => {
	it('returns correct line count', () => {
		const js = 'const x = 1;\nfunction foo() {\n  return x;\n}';
		const lines = renderJavascript(js);
		expect(lines.length).toBe(4);
	});

	it('handles comments', () => {
		const js = '// this is a comment\nconst a = 1;';
		const lines = renderJavascript(js);
		expect(lines.length).toBe(2);
	});
});

describe('renderCss', () => {
	it('returns correct line count', () => {
		const css = 'body {\n  color: red;\n  font-size: 16px;\n}';
		const lines = renderCss(css);
		expect(lines.length).toBe(4);
	});

	it('handles comments', () => {
		const css = '/* comment */\nbody {\n  color: red;\n}';
		const lines = renderCss(css);
		expect(lines.length).toBe(4);
	});
});

describe('renderHexDump', () => {
	it('produces offset + hex + ASCII columns', () => {
		const lines = renderHexDump('Hello World!');
		expect(lines.length).toBe(1); // 12 chars fit in one 16-byte row
		// Should contain the offset
		expect(lines[0]).toContain('00000000');
	});

	it('splits into multiple rows for longer input', () => {
		const input = 'A'.repeat(32);
		const lines = renderHexDump(input);
		expect(lines.length).toBe(2);
	});

	it('handles empty input', () => {
		const lines = renderHexDump('');
		expect(lines.length).toBe(0);
	});
});

describe('renderResponseBody', () => {
	it('routes xml format to renderXml', () => {
		const lines = renderResponseBody('xml', '<root/>');
		expect(lines.length).toBeGreaterThan(0);
	});

	it('routes html format to renderXml', () => {
		const lines = renderResponseBody('html', '<html><body/></html>');
		expect(lines.length).toBeGreaterThan(0);
	});

	it('routes csv format to renderCsv', () => {
		const lines = renderResponseBody('csv', 'a,b\n1,2');
		expect(lines.length).toBe(3); // header, separator, data
	});

	it('routes json to raw split', () => {
		const lines = renderResponseBody('json', '{\n  "key": "value"\n}');
		expect(lines.length).toBe(3);
	});

	it('routes text to raw split', () => {
		const lines = renderResponseBody('text', 'line1\nline2');
		expect(lines.length).toBe(2);
	});
});
