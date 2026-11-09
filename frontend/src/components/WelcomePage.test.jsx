// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import WelcomePage from './WelcomePage'

describe('WelcomePage', () => {
  it('renders the ordered simulation walkthrough', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'How to use the simulation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveClass('welcome-how-to-steps')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(
      screen.getByRole('heading', { name: 'Register a simulated patient' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Respond to clinical alerts' }),
    ).toBeInTheDocument()
  })
})
