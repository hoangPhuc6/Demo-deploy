import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import IncidentsPage from '../../pages/incidents/IncidentsPage'

// Mock the API
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}))

describe('IncidentsPage', () => {
  it('should render incidents page', async () => {
    render(
      <BrowserRouter>
        <IncidentsPage />
      </BrowserRouter>
    )
    // Check if page renders (adjust text as needed)
    expect(screen.getByText(/sự cố|incident/i)).toBeInTheDocument()
  })
})
