import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { StatusBar } from './index.js';

describe('StatusBar', () => {
	it('renders spec title', () => {
		const { lastFrame } = render(
			<StatusBar specTitle="Petstore API" activePane="navigator" />,
		);
		expect(lastFrame()).toContain('Petstore API');
	});

	it('renders breadcrumb for navigator', () => {
		const { lastFrame } = render(
			<StatusBar specTitle="Petstore" activePane="navigator" />,
		);
		expect(lastFrame()).toContain('Endpoints');
	});
});
