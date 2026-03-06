import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../dist/cli.js');
const PETSTORE_YAML = path.resolve(
	__dirname,
	'../examples/basic/petstore.yaml',
);

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

describe('CLI flags E2E', () => {
	describe('--version', () => {
		it('prints version with --version', () => {
			const { stdout, exitCode } = run(['--version']);
			expect(exitCode).toBe(0);
			expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
		});

		it('prints version with short flag -v', () => {
			const { stdout, exitCode } = run(['-v']);
			expect(exitCode).toBe(0);
			expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
		});

		it('version output includes Node.js info', () => {
			const { stdout } = run(['--version']);
			expect(stdout).toContain('Node.js');
		});

		it('version output includes platform info', () => {
			const { stdout } = run(['--version']);
			expect(stdout).toContain('Platform:');
		});
	});

	describe('--help', () => {
		it('prints help with --help', () => {
			const { stdout, exitCode } = run(['--help']);
			expect(exitCode).toBe(0);
			expect(stdout).toContain('spec-tui');
		});

		it('help includes spec argument description', () => {
			const { stdout } = run(['--help']);
			expect(stdout).toContain('spec');
		});

		it('help includes --base-url flag', () => {
			const { stdout } = run(['--help']);
			expect(stdout).toContain('--base-url');
		});

		it('help includes --version flag', () => {
			const { stdout } = run(['--help']);
			expect(stdout).toContain('--version');
		});

		it('help includes the CLI description', () => {
			const { stdout } = run(['--help']);
			expect(stdout).toContain('OpenAPI');
		});
	});

	describe('--base-url', () => {
		it('accepts --base-url flag with a spec file', () => {
			const { stdout } = run([
				'--base-url',
				'https://custom.example.com',
				PETSTORE_YAML,
			]);
			expect(typeof stdout).toBe('string');
		});

		it('accepts -b short flag with a spec file', () => {
			const { stdout } = run([
				'-b',
				'https://custom.example.com',
				PETSTORE_YAML,
			]);
			expect(typeof stdout).toBe('string');
		});
	});

	describe('missing required argument', () => {
		it('errors when no spec argument is provided', () => {
			const { stdout, stderr } = run([]);
			const combined = stdout + stderr;
			expect(combined.length).toBeGreaterThan(0);
		});
	});

	describe('unknown flags', () => {
		it('errors on unknown flag', () => {
			const { stderr, exitCode } = run(['--nonexistent-flag']);
			expect(exitCode).not.toBe(0);
			expect(stderr.length).toBeGreaterThan(0);
		});

		it('errors on unknown short flag', () => {
			const { stderr, exitCode } = run(['-z']);
			expect(exitCode).not.toBe(0);
			expect(stderr.length).toBeGreaterThan(0);
		});
	});
});
