import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../pages/auth/LoginPage'

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
  })

  it('should display "Đăng ký" text on login page', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    expect(screen.getByText('Đăng ký')).toBeInTheDocument()
  })

  it('should display login form elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/đăng nhập/i)).toBeInTheDocument()
  })
})
