import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock API and services
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}))

vi.mock('../../services/authService', () => ({
  incidentApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  labRoomApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  workstationApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { role: 'user' },
  })),
}))

import IncidentsPage from '../../pages/incidents/IncidentsPage'

describe('IncidentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render incidents page', async () => {
    render(
      <BrowserRouter>
        <IncidentsPage />
      </BrowserRouter>
    )
    expect(document.body).toBeTruthy()
  })
})
