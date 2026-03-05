#!/usr/bin/env node
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { render } from 'ink';
import App from './index.js';

declare const __CLI_VERSION__: string;

function runCLI(args: string[] = process.argv.slice(2)): void {
	const versionInfo = [
		`spec-tui v${__CLI_VERSION__}`,
		`Node.js ${process.version}`,
		`Platform: ${process.platform} ${process.arch}`,
	].join('\n');

	const program = new Command();

	program
		.name('spec-tui')
		.description('Keyboard-driven TUI for exploring and testing OpenAPI specs')
		.version(versionInfo, '-v, --version', 'Display version information')
		.argument('<spec>', 'Path or URL to OpenAPI/Swagger spec')
		.option('-b, --base-url <url>', 'Override base URL from spec')
		.action((spec: string, options: { baseUrl?: string }) => {
			render(<App specSource={spec} baseUrl={options.baseUrl} />);
		});

	program.parse(args, { from: 'user' });
}

export { runCLI };

let isMain = false;
try {
	if (process.argv[1]) {
		const scriptPath = fs.realpathSync(process.argv[1]);
		const currentFile = fileURLToPath(import.meta.url);
		isMain = scriptPath === currentFile;
	}
} catch {
	isMain = false;
}

if (isMain) {
	runCLI();
}
