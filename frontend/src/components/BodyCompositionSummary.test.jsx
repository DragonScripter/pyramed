
// @vitest-environment jsdom

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import BodyCompositionSummary from './BodyCompositionSummary';

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

describe('BodyCompositionSummary', () => {
  it('displays the latest measurements', () => {
    render(<BodyCompositionSummary data={measurements} />);

    expect(screen.getByText('25.1 kg/m²')).toBeTruthy();
    expect(screen.getByText('27.8 %')).toBeTruthy();
    expect(screen.getByText('32.5 kg')).toBeTruthy();
  });

  it('calculates changes over the selected period', () => {
    render(<BodyCompositionSummary data={measurements} />);

    expect(screen.getByText('Change: -0.3 kg/m²')).toBeTruthy();
    expect(screen.getByText('Change: -0.7 pp')).toBeTruthy();
    expect(screen.getByText('Change: +0.4 kg')).toBeTruthy();
  });

  it('handles missing measurements', () => {
    render(<BodyCompositionSummary data={[]} />);

    expect(screen.getAllByText('N/A')).toHaveLength(3);
    expect(screen.getAllByText('Change: N/A')).toHaveLength(3);
  });
});
