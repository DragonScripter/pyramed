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

	it('shows the exact measurements and threshold warnings when active', () => {
		render(
			<CriticalAlarmBanner
				active
				violations={[
					{ metric: 'SpO2', value: 88, unit: '%' },
					{ metric: 'HR', value: 130, unit: 'bpm' },
				]}
			/>
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Critical vital alert')).toBeInTheDocument();
		expect(screen.getByText('SpO2: 88% (below the 90% critical threshold)')).toBeInTheDocument();
		expect(screen.getByText('Heart rate: 130 bpm (above the 120 bpm critical threshold)')).toBeInTheDocument();
	});
});