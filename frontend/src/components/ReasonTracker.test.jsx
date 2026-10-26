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

  it('lists active critical measurements', () => {
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
    expect(screen.getByText('SpO2: 88%')).toBeInTheDocument();
    expect(screen.getByText('HR: 130bpm')).toBeInTheDocument();
  });
});
