import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardPage from '../../pages/DashboardPage'

// Mock the API
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

describe('DashboardPage', () => {
  it('should render dashboard', async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )
    // Check if page contains expected text (adjust as needed)
    expect(screen.getByText(/dashboard|trang chủ/i)).toBeInTheDocument()
  })
})
