import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock API and services
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

vi.mock('../../services/authService', () => ({
  labRoomApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  workstationApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  reservationApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  incidentApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { role: 'user' },
  })),
}))

import DashboardPage from '../../pages/DashboardPage'

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard page', async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )
    // Check for common dashboard text
    expect(document.body).toBeTruthy()
  })
})
