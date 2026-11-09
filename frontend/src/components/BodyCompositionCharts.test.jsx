
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BodyCompositionCharts from './BodyCompositionCharts';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Line: ({ dataKey }) => (
    <div data-testid={`chart-line-${dataKey}`} />
  ),
}));

afterEach(() => {
  cleanup();
});

describe('BodyCompositionCharts', () => {
  const measurements = [
    {
      date: '2026-10-01',
      bmi: 25.4,
      bodyFatPercentage: 28.5,
      muscleMass: 32.1,
    },
    {
      date: '2026-11-01',
      bmi: 25.1,
      bodyFatPercentage: 27.8,
      muscleMass: 32.5,
    },
  ];

  it('displays all three chart titles', () => {
    render(<BodyCompositionCharts data={measurements} />);

    expect(screen.getByText('BMI Trend')).toBeTruthy();
    expect(screen.getByText('Body Fat Trend')).toBeTruthy();
    expect(screen.getByText('Muscle Mass Trend')).toBeTruthy();
  });

  it('configures the correct measurement fields', () => {
    render(<BodyCompositionCharts data={measurements} />);

    expect(screen.getByTestId('chart-line-bmi')).toBeTruthy();

    expect(
      screen.getByTestId('chart-line-bodyFatPercentage')
    ).toBeTruthy();

    expect(
      screen.getByTestId('chart-line-muscleMass')
    ).toBeTruthy();
  });

  it('renders without measurements', () => {
    render(<BodyCompositionCharts data={[]} />);

    expect(screen.getByText('BMI Trend')).toBeTruthy();
  });
});
