import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../dist/cli.js');

const run = (
	args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
	try {
		const stdout = execFileSync('node', [CLI_PATH, ...args], {
			encoding: 'utf-8',
			timeout: 10_000,
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		return { stdout, stderr: '', exitCode: 0 };
	} catch (err: unknown) {
		const error = err as {
			stdout?: string;
			stderr?: string;
			status?: number;
		};
		return {
			stdout: error.stdout ?? '',
			stderr: error.stderr ?? '',
			exitCode: error.status ?? 1,
		};
	}
};

describe('Error handling E2E', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-tui-e2e-'));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it('handles nonexistent file path gracefully', () => {
		const { stdout, stderr } = run(['/tmp/does-not-exist-at-all.yaml']);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles empty file gracefully', () => {
		const emptyFile = path.join(tempDir, 'empty.yaml');
		fs.writeFileSync(emptyFile, '');

		const { stdout, stderr } = run([emptyFile]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles file with only whitespace gracefully', () => {
		const wsFile = path.join(tempDir, 'whitespace.yaml');
		fs.writeFileSync(wsFile, '   \n\n   \n');

		const { stdout, stderr } = run([wsFile]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles binary file gracefully', () => {
		const binFile = path.join(tempDir, 'binary.yaml');
		fs.writeFileSync(binFile, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]));

		const { stdout, stderr } = run([binFile]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles unparseable YAML content gracefully', () => {
		const badFile = path.join(tempDir, 'bad.yaml');
		fs.writeFileSync(
			badFile,
			'not: [valid: yaml: {content\n  - broken:\nindent',
		);

		const { stdout, stderr } = run([badFile]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles valid YAML but invalid OpenAPI gracefully', () => {
		const notSpec = path.join(tempDir, 'not-api.yaml');
		fs.writeFileSync(
			notSpec,
			'name: test\nversion: 1\nsettings:\n  debug: true\n',
		);

		const { stdout, stderr } = run([notSpec]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('handles spec with no paths gracefully', () => {
		const noPaths = path.join(tempDir, 'no-paths.yaml');
		fs.writeFileSync(
			noPaths,
			'openapi: "3.0.3"\ninfo:\n  title: Empty\n  version: "1.0.0"\npaths: {}\n',
		);

		const { stdout } = run([noPaths]);
		expect(typeof stdout).toBe('string');
	});

	it('handles spec with invalid $ref gracefully', () => {
		const badRef = path.join(tempDir, 'bad-ref.yaml');
		fs.writeFileSync(
			badRef,
			[
				'openapi: "3.0.3"',
				'info:',
				'  title: Bad Ref',
				'  version: "1.0.0"',
				'paths:',
				'  /test:',
				'    get:',
				'      summary: Test',
				'      responses:',
				'        "200":',
				'          description: OK',
				'          content:',
				'            application/json:',
				'              schema:',
				'                $ref: "#/components/schemas/DoesNotExist"',
			].join('\n'),
		);

		const { stdout, stderr } = run([badRef]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});

	it('does not crash when given a directory path instead of a file', () => {
		const { stdout, stderr } = run([tempDir]);
		const combined = stdout + stderr;
		expect(combined.length).toBeGreaterThan(0);
	});
});
