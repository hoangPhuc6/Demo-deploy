import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock modules
vi.mock('../../services/authService', () => ({
  register: vi.fn(),
}))

vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn(),
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
    setAuth: vi.fn(),
  })),
}))

import RegisterPage from '../../pages/auth/RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display register heading', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/đăng ký/i)).toBeInTheDocument()
  })

  it('should display login link', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )
    const loginLink = screen.queryByText(/đăng nhập/i)
    expect(loginLink).toBeTruthy()
  })
})
