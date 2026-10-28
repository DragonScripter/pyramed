// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ReasonTracker from './ReasonTracker';

afterEach(cleanup);

describe('ReasonTracker', () => {
  it('shows a neutral state when no alert is active', () => {
    render(<ReasonTracker />);

    expect(screen.getByRole('heading', { name: 'Reason tracker' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No active alert reasons.');
  });

	it('maps active critical measurements to their mathematical reasons', () => {
    render(
      <ReasonTracker
        active
        violations={[
          { metric: 'SpO2', value: 88, unit: '%' },
          { metric: 'HR', value: 130, unit: 'bpm' },
        ]}
      />,
    );

    expect(screen.getAllByText('Critical')).toHaveLength(2);
		expect(screen.getByRole('status')).toHaveTextContent('Active critical alert evidence: 2 reasons require review.');
		expect(screen.getByRole('region', { name: 'Reason tracker' })).toHaveClass('reason-tracker--critical');
		expect(screen.getByText(
			'Flagged as critical because SpO2 fell to 88%, crossing the minimum baseline safety threshold of 90%.',
		)).toBeInTheDocument();
		expect(screen.getByText(
			'Flagged as critical because Heart rate rose to 130 bpm, crossing the maximum baseline safety threshold of 120 bpm.',
		)).toBeInTheDocument();
  });

  it('uses a warning label and tone for warning evidence', () => {
    render(
      <ReasonTracker
        active
        violations={[{ metric: 'SpO2', value: 89, unit: '%', severity: 'warning' }]}
      />,
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Reason tracker' })).toHaveClass('reason-tracker--warning');
  });
});
