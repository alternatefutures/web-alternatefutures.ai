'use client'

import { Suspense, useState, useRef, useCallback, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import './login.css'

type Step = 'email' | 'code'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

const isStaging = process.env.NEXT_PUBLIC_STAGING === 'true'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/blog'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStagingLogin = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/staging-login', { method: 'POST' })
      if (!res.ok) {
        setError('Staging login failed')
        return
      }
      router.push(redirect)
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }, [redirect, router])

  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleRequestCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)

      try {
        const res = await fetch('/api/auth/request-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to send code')
          return
        }

        setStep('code')
        // Focus the first code input after render
        setTimeout(() => codeRefs.current[0]?.focus(), 50)
      } catch {
        setError('Connection error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [email],
  )

  const handleCodeInput = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        // Handle paste: distribute digits across inputs
        const digits = value.replace(/\D/g, '').slice(0, 6).split('')
        const newCode = [...code]
        digits.forEach((d, i) => {
          if (index + i < 6) newCode[index + i] = d
        })
        setCode(newCode)
        const nextIndex = Math.min(index + digits.length, 5)
        codeRefs.current[nextIndex]?.focus()
        return
      }

      const digit = value.replace(/\D/g, '')
      const newCode = [...code]
      newCode[index] = digit
      setCode(newCode)

      if (digit && index < 5) {
        codeRefs.current[index + 1]?.focus()
      }
    },
    [code],
  )

  const handleCodeKeyDown = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus()
      }
    },
    [code],
  )

  const handleVerifyCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const codeStr = code.join('')
      if (codeStr.length !== 6) {
        setError('Please enter the full 6-digit code')
        return
      }

      setError('')
      setLoading(true)

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: codeStr }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || data.message || 'Invalid code')
          return
        }

        router.push(redirect)
      } catch {
        setError('Connection error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [email, code, redirect, router],
  )

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-text">Alternate Futures</span>
        </div>

        {step === 'email' ? (
          <>
            <h1 className="login-title">Sign in to Admin</h1>
            <p className="login-subtitle">
              Enter your email to receive a verification code.
            </p>

            {isStaging && (
              <div className="login-form">
                <button
                  type="button"
                  className="login-btn"
                  style={{ background: '#BE4200' }}
                  disabled={loading}
                  onClick={handleStagingLogin}
                >
                  {loading ? 'Signing in...' : 'Dev Login (Staging)'}
                </button>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: '8px 0' }}>or sign in with email below</div>
              </div>
            )}

            <form className="login-form" onSubmit={handleRequestCode}>
              <div>
                <label className="login-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-btn"
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="login-title">Enter verification code</h1>
            <p className="login-sent-to">
              Code sent to <strong>{email}</strong>
            </p>

            <form className="login-form" onSubmit={handleVerifyCode}>
              <div className="login-code-inputs">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="login-code-input"
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e.key)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-btn"
                disabled={loading || code.join('').length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & sign in'}
              </button>

              <button
                type="button"
                className="login-back-btn"
                onClick={() => {
                  setStep('email')
                  setCode(['', '', '', '', '', ''])
                  setError('')
                }}
              >
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
