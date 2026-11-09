// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import WelcomePage from './WelcomePage'

afterEach(cleanup)

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

  it('renders team credits with names and responsibilities', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Built by a multidisciplinary team' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Jude Ma' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Gloria Ojiebun' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Yena Hong' })).toBeInTheDocument()
    expect(screen.getByText('Project Lead, DevOps & QA Lead')).toBeInTheDocument()
  })
})
