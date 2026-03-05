import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import type { ResponseData } from '../../types/ResponseData/index.js';
import { parseSuggestedFilename, ResponseView } from './index.js';

function makeResponse(overrides: Partial<ResponseData> = {}): ResponseData {
	return {
		status: 200,
		statusText: 'OK',
		headers: { 'content-type': 'application/json' },
		body: '{"id":1}',
		duration: 42,
		timestamp: new Date().toISOString(),
		...overrides,
	};
}

describe('ResponseView', () => {
	it("renders 'No response yet' when response is null and not loading", () => {
		const { lastFrame } = render(
			<ResponseView response={null} loading={false} />,
		);
		expect(lastFrame()).toContain('No response yet');
	});

	it("renders 'Sending request...' when loading is true", () => {
		const { lastFrame } = render(
			<ResponseView response={null} loading={true} />,
		);
		expect(lastFrame()).toContain('Sending request...');
	});

	it('renders status code and statusText when response is present', () => {
		const response = makeResponse({ status: 201, statusText: 'Created' });
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		const frame = lastFrame();
		if (!frame) throw new Error('No frame rendered');
		expect(frame).toContain('201');
		expect(frame).toContain('Created');
	});

	it('shows format badge for xml content', () => {
		const response = makeResponse({
			headers: { 'content-type': 'application/xml' },
			body: '<root/>',
		});
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		expect(lastFrame()).toContain('XML');
	});

	it('shows format badge for html content', () => {
		const response = makeResponse({
			headers: { 'content-type': 'text/html' },
			body: '<html></html>',
		});
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		expect(lastFrame()).toContain('HTML');
	});

	it('shows format badge for csv content', () => {
		const response = makeResponse({
			headers: { 'content-type': 'text/csv' },
			body: 'a,b\n1,2',
		});
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		expect(lastFrame()).toContain('CSV');
	});

	it('does not show format badge for json content', () => {
		const response = makeResponse({
			headers: { 'content-type': 'application/json' },
			body: '{"ok":true}',
		});
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		const frame = lastFrame();
		if (!frame) throw new Error('No frame rendered');
		// The badge text "(JSON)" should not appear; the heading is just "Response"
		expect(frame).not.toMatch(/\(JSON\)/);
	});

	it('does not show format badge for text content', () => {
		const response = makeResponse({
			headers: { 'content-type': 'text/plain' },
			body: 'hello world',
		});
		const { lastFrame } = render(
			<ResponseView response={response} loading={false} />,
		);
		const frame = lastFrame();
		if (!frame) throw new Error('No frame rendered');
		expect(frame).not.toMatch(/\(TXT\)/);
	});

	// ── Save mode tests ──────────────────────────────────────────────

	it("renders 'Save Response' heading and path input in save mode", () => {
		const response = makeResponse();
		const { lastFrame } = render(
			<ResponseView
				response={response}
				loading={false}
				saveMode={true}
				onSave={() => {}}
				onCancelSave={() => {}}
			/>,
		);
		const frame = lastFrame();
		if (!frame) throw new Error('No frame rendered');
		expect(frame).toContain('Save Response');
		expect(frame).toContain('Enter file path');
	});

	it('uses suggested filename from Content-Disposition header', () => {
		const result = parseSuggestedFilename(
			{ 'content-disposition': 'attachment; filename="report.txt"' },
			'binary',
		);
		expect(result).toBe('report.txt');
	});

	it('falls back to format-based filename for json', () => {
		const result = parseSuggestedFilename({}, 'json');
		expect(result).toBe('response.json');
	});

	it('falls back to format-based filename for binary', () => {
		const result = parseSuggestedFilename({}, 'binary');
		expect(result).toBe('response.bin');
	});

	it('strips path traversal from Content-Disposition filename', () => {
		const result = parseSuggestedFilename(
			{ 'content-disposition': 'attachment; filename="../../evil.txt"' },
			'text',
		);
		expect(result).toBe('evil.txt');
		expect(result).not.toContain('../');
	});

	it('handles format-based filenames for all formats', () => {
		expect(parseSuggestedFilename({}, 'xml')).toBe('response.xml');
		expect(parseSuggestedFilename({}, 'html')).toBe('response.html');
		expect(parseSuggestedFilename({}, 'csv')).toBe('response.csv');
		expect(parseSuggestedFilename({}, 'javascript')).toBe('response.js');
		expect(parseSuggestedFilename({}, 'css')).toBe('response.css');
		expect(parseSuggestedFilename({}, 'text')).toBe('response.txt');
	});
});
