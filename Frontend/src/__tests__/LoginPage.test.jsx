import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Mock modules before importing component
vi.mock('../../services/authService', () => ({
  login: vi.fn(),
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

// Mock zustand store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    setAuth: vi.fn(),
  })),
}))

import LoginPage from '../../pages/auth/LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display "Đăng ký" link on login page', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    const registerLink = screen.queryByText('Đăng ký')
    expect(registerLink).toBeTruthy()
  })

  it('should display login heading', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/đăng nhập/i)).toBeInTheDocument()
  })
})
