// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CriticalAlarmBanner from './CriticalAlarmBanner';

afterEach(cleanup);

describe('CriticalAlarmBanner', () => {
	it('does not render while inactive', () => {
		const { container } = render(<CriticalAlarmBanner />);

		expect(container).toBeEmptyDOMElement();
	});

	it('announces the critical alert when active', () => {
		render(<CriticalAlarmBanner active message="Heart rate is critical." />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Critical vital alert')).toBeInTheDocument();
		expect(screen.getByText('Heart rate is critical.')).toBeInTheDocument();
	});
});