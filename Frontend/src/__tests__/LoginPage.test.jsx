import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('LoginPage Content Tests', () => {
  it('should have "Đăng ký" text in LoginPage', () => {
    const loginPagePath = join(__dirname, '../../pages/auth/LoginPage.jsx')
    const content = readFileSync(loginPagePath, 'utf-8')
    
    expect(content).toContain('Đăng ký')
  })

  it('should have login form elements', () => {
    const loginPagePath = join(__dirname, '../../pages/auth/LoginPage.jsx')
    const content = readFileSync(loginPagePath, 'utf-8')
    
    expect(content).toContain('Email')
    expect(content).toContain('Mật khẩu')
  })
})
