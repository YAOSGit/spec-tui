import { describe, expect, it } from 'vitest';
import { statusColor } from './index.js';

describe('statusColor', () => {
	it('returns green for 2xx', () => {
		expect(statusColor(200)).toBe('green');
		expect(statusColor(201)).toBe('green');
		expect(statusColor(299)).toBe('green');
	});

	it('returns yellow for 3xx', () => {
		expect(statusColor(301)).toBe('yellow');
		expect(statusColor(304)).toBe('yellow');
	});

	it('returns red for 4xx', () => {
		expect(statusColor(400)).toBe('red');
		expect(statusColor(404)).toBe('red');
		expect(statusColor(499)).toBe('red');
	});

	it('returns magenta for 5xx', () => {
		expect(statusColor(500)).toBe('magenta');
		expect(statusColor(503)).toBe('magenta');
	});

	it('returns gray for status 0 (network error)', () => {
		expect(statusColor(0)).toBe('gray');
	});

	it('returns gray for 1xx (informational)', () => {
		expect(statusColor(100)).toBe('gray');
	});
});
