import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from '../../pages/auth/RegisterPage'

// Mock the auth service
vi.mock('../../services/authService', () => ({
  default: {
    register: vi.fn(),
  },
}))

describe('RegisterPage', () => {
  it('should display register form', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/đăng ký/i)).toBeInTheDocument()
  })

  it('should display email input field', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    )
    const emailInputs = screen.queryAllByPlaceholderText(/email/i)
    expect(emailInputs.length).toBeGreaterThan(0)
  })
})
