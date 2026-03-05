import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import type { Endpoint } from '../../types/Endpoint/index.js';
import { EndpointNavigator } from './index.js';

const mockEndpoints: Endpoint[] = [
	{
		method: 'get',
		path: '/pets',
		summary: 'List all pets',
		tags: ['pets'],
		parameters: [],
		responses: {},
		deprecated: false,
		contentTypes: { requestContentTypes: [], responseContentTypes: {} },
	},
	{
		method: 'post',
		path: '/pets',
		summary: 'Create a pet',
		tags: ['pets'],
		parameters: [],
		responses: {},
		deprecated: false,
		contentTypes: { requestContentTypes: [], responseContentTypes: {} },
	},
];

describe('EndpointNavigator', () => {
	it('renders endpoint paths', () => {
		const { lastFrame } = render(
			<EndpointNavigator
				endpoints={mockEndpoints}
				selectedIndex={0}
			/>,
		);
		const frame = lastFrame();
		expect(frame).toContain('/pets');
	});

	it('renders HTTP methods', () => {
		const { lastFrame } = render(
			<EndpointNavigator
				endpoints={mockEndpoints}
				selectedIndex={0}
			/>,
		);
		const frame = lastFrame();
		expect(frame).toContain('GET');
	});
});
