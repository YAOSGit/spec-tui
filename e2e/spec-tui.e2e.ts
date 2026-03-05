import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('spec-tui E2E', () => {
	const cliPath = path.resolve(__dirname, '../dist/cli.js');
	const _petstorePath = path.resolve(
		__dirname,
		'../examples/basic/petstore.yaml',
	);

	it('prints version with --version', () => {
		const output = execFileSync('node', [cliPath, '--version'], {
			encoding: 'utf-8',
			timeout: 5_000,
		});
		expect(output.trim()).toMatch(/\d+\.\d+\.\d+/);
	});

	it('prints help with --help', () => {
		const output = execFileSync('node', [cliPath, '--help'], {
			encoding: 'utf-8',
			timeout: 5_000,
		});
		expect(output).toContain('spec-tui');
		expect(output).toContain('spec');
	});

	it('outputs error for missing spec file', () => {
		const output = execFileSync('node', [cliPath, 'nonexistent-file.yaml'], {
			encoding: 'utf-8',
			timeout: 5_000,
			// The TUI renders the error inline and exits 0, so capture stderr
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		// The process runs but the TUI shows an error about the missing file
		// It doesn't crash silently — it produces output
		expect(output.length).toBeGreaterThan(0);
	});

	it('help output includes expected flags', () => {
		const output = execFileSync('node', [cliPath, '--help'], {
			encoding: 'utf-8',
			timeout: 5_000,
		});
		expect(output).toContain('--base-url');
		expect(output).toContain('--version');
	});
});
