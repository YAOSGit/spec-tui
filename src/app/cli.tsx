#!/usr/bin/env node
import {
	createCLI,
	fatalError,
	formatError,
	getExitCode,
	runIfMain,
} from '@yaos-git/toolkit/cli';
import { render } from 'ink';
import App from './index.js';

declare const __CLI_VERSION__: string;

async function runCLI(args: string[] = process.argv.slice(2)): Promise<void> {
	const { program } = createCLI({
		name: 'spec-tui',
		description: 'Keyboard-driven TUI for exploring and testing OpenAPI specs',
		version: __CLI_VERSION__,
	});

	program
		.argument('<spec>', 'Path or URL to OpenAPI/Swagger spec')
		.option('-b, --base-url <url>', 'Override base URL from spec')
		.action((spec: string, options: { baseUrl?: string }) => {
			render(<App specSource={spec} baseUrl={options.baseUrl} />);
		});

	try {
		await program.parseAsync(args, { from: 'user' });
	} catch (err) {
		if (err instanceof Error && 'exitCode' in err) {
			process.exitCode = getExitCode(err);
		} else {
			fatalError(formatError(err));
		}
	}
}

export { runCLI };

runIfMain(import.meta.url, () => runCLI());
