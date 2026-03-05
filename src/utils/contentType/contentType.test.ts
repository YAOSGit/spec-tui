import { describe, expect, it } from 'vitest';
import {
	detectContentFormat,
	formatBadgeColor,
	formatBadgeLabel,
} from './index.js';

describe('detectContentFormat', () => {
	describe('header-based detection', () => {
		it('detects application/json', () => {
			expect(detectContentFormat('application/json')).toBe('json');
		});

		it('detects json with charset', () => {
			expect(detectContentFormat('application/json; charset=utf-8')).toBe(
				'json',
			);
		});

		it('detects text/xml', () => {
			expect(detectContentFormat('text/xml')).toBe('xml');
		});

		it('detects application/xml', () => {
			expect(detectContentFormat('application/xml')).toBe('xml');
		});

		it('detects text/html', () => {
			expect(detectContentFormat('text/html')).toBe('html');
		});

		it('detects text/csv', () => {
			expect(detectContentFormat('text/csv')).toBe('csv');
		});

		it('detects application/javascript', () => {
			expect(detectContentFormat('application/javascript')).toBe('javascript');
		});

		it('detects text/css', () => {
			expect(detectContentFormat('text/css')).toBe('css');
		});

		it('detects application/octet-stream as binary', () => {
			expect(detectContentFormat('application/octet-stream')).toBe('binary');
		});

		it('detects image/png as binary', () => {
			expect(detectContentFormat('image/png')).toBe('binary');
		});

		it('detects audio/mpeg as binary', () => {
			expect(detectContentFormat('audio/mpeg')).toBe('binary');
		});

		it('detects video/mp4 as binary', () => {
			expect(detectContentFormat('video/mp4')).toBe('binary');
		});
	});

	describe('body sniffing fallback', () => {
		it('detects JSON body from text/plain', () => {
			expect(detectContentFormat('text/plain', '{"key": "value"}')).toBe(
				'json',
			);
		});

		it('detects JSON array body', () => {
			expect(detectContentFormat('text/plain', '[1, 2, 3]')).toBe('json');
		});

		it('detects XML body from text/plain', () => {
			expect(
				detectContentFormat('text/plain', '<?xml version="1.0"?><root/>'),
			).toBe('xml');
		});

		it('detects HTML body without header', () => {
			expect(
				detectContentFormat(
					undefined,
					'<!DOCTYPE html><html><body></body></html>',
				),
			).toBe('html');
		});

		it('detects HTML with <html> tag', () => {
			expect(
				detectContentFormat(undefined, '<html><body>Hello</body></html>'),
			).toBe('html');
		});
	});

	describe('fallback to text', () => {
		it('returns text for unknown content type', () => {
			expect(detectContentFormat('application/x-custom')).toBe('text');
		});

		it('returns text for no header and no body', () => {
			expect(detectContentFormat()).toBe('text');
		});

		it('returns text for plain string body', () => {
			expect(detectContentFormat(undefined, 'Hello world')).toBe('text');
		});
	});
});

describe('formatBadgeLabel', () => {
	it('returns JSON for json', () => {
		expect(formatBadgeLabel('json')).toBe('JSON');
	});

	it('returns XML for xml', () => {
		expect(formatBadgeLabel('xml')).toBe('XML');
	});

	it('returns JS for javascript', () => {
		expect(formatBadgeLabel('javascript')).toBe('JS');
	});

	it('returns BIN for binary', () => {
		expect(formatBadgeLabel('binary')).toBe('BIN');
	});

	it('returns TXT for text', () => {
		expect(formatBadgeLabel('text')).toBe('TXT');
	});
});

describe('formatBadgeColor', () => {
	it('returns green for json', () => {
		expect(formatBadgeColor('json')).toBe('green');
	});

	it('returns cyan for xml', () => {
		expect(formatBadgeColor('xml')).toBe('cyan');
	});

	it('returns red for binary', () => {
		expect(formatBadgeColor('binary')).toBe('red');
	});
});
