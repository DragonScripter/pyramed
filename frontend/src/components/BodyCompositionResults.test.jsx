// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BodyCompositionResults from './BodyCompositionResults';

vi.mock('./BodyCompositionCharts', () => ({
  default: () => <div>Mock trend charts</div>,
}));

vi.mock('./BodyCompositionSummary', () => ({
  default: () => <div>Mock summary cards</div>,
}));

describe('BodyCompositionResults', () => {
  it('shows loading state', () => {
    render(<BodyCompositionResults loading />);
    expect(
      screen.getByText(/Loading body composition data/i)
    ).toBeTruthy();
  });

  it('shows empty state', () => {
    render(<BodyCompositionResults data={[]} />);
    expect(
      screen.getByText(/No body composition measurements/i)
    ).toBeTruthy();
  });

  it('shows error state', () => {
    render(<BodyCompositionResults error="Network error" />);
    expect(screen.getByText(/Network error/i)).toBeTruthy();
  });

  it('shows charts and summary when data exists', () => {
    const data = [
      {
        date: '2026-10-01',
        bmi: 25.4,
        bodyFatPercentage: 28.5,
        muscleMass: 32.1,
      },
    ];

    render(<BodyCompositionResults data={data} />);

    expect(screen.getByText('Mock trend charts')).toBeTruthy();
    expect(screen.getByText('Mock summary cards')).toBeTruthy();
  });
});
