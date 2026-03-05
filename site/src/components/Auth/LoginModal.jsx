import React, { useState } from 'react'
import { useAuth } from '@authContext/AuthContext'

// ── styles ───────────────────────────────────────────────────────────────────

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modal = {
  background: '#1a1a2e',
  border: '1px solid #2d2d4e',
  borderRadius: 8,
  padding: '2rem',
  width: 380,
  maxWidth: '92vw',
  color: '#e0e0e0',
  fontFamily: 'sans-serif',
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.55rem 0.75rem',
  marginTop: '0.3rem',
  marginBottom: '1rem',
  background: '#12122a',
  border: '1px solid #3a3a5e',
  borderRadius: 4,
  color: '#e0e0e0',
  fontSize: 14,
  boxSizing: 'border-box',
}

const btnPrimary = {
  width: '100%',
  padding: '0.6rem',
  background: '#6c47ff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 15,
  marginBottom: '0.75rem',
}

const btnSecondary = {
  ...btnPrimary,
  background: 'transparent',
  border: '1px solid #6c47ff',
  color: '#6c47ff',
}

const dividerRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  margin: '1rem 0',
}

const dividerLine = {
  flex: 1,
  height: 1,
  background: '#3a3a5e',
}

const oauthBtn = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  padding: '0.55rem 0.75rem',
  border: '1px solid #3a3a5e',
  borderRadius: 4,
  background: '#12122a',
  color: '#e0e0e0',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  marginBottom: '0.6rem',
  transition: 'background 0.15s',
}

// ── OAuth provider catalogue ────────────────────────────────────────────────
// Enable/disable providers by editing this list.  Each `id` must match the
// provider name registered in your Supabase dashboard (Auth → Providers).

const OAUTH_PROVIDERS = [
  {
    id: 'google',
    label: 'Continue with Google',
    // Simple inline SVG so we don't need external assets
    icon: (
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#e0e0e0">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.17c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.7.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
  {
    id: 'discord',
    label: 'Continue with Discord',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
        <path d="M20.32 4.37A19.8 19.8 0 0 0 15.39 3c-.22.39-.47.91-.64 1.32a18.4 18.4 0 0 0-5.5 0A13 13 0 0 0 8.61 3a19.7 19.7 0 0 0-4.93 1.37C.53 9.05-.33 13.6.1 18.08a20 20 0 0 0 6.07 3.07 14.7 14.7 0 0 0 1.29-2.1 12.8 12.8 0 0 1-2.04-.98l.48-.38a14.2 14.2 0 0 0 12.2 0l.49.38c-.65.39-1.33.72-2.05.98.37.74.8 1.44 1.3 2.1a19.95 19.95 0 0 0 6.07-3.07c.5-5.24-.86-9.77-3.59-13.71zM8.01 15.33c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42 2.17 1.09 2.15 2.42c0 1.33-.95 2.42-2.15 2.42zm7.98 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42 2.17 1.09 2.15 2.42c0 1.33-.94 2.42-2.15 2.42z"/>
      </svg>
    ),
  },
]

/**
 * LoginModal
 *
 * Usage:
 *   import LoginModal from '../Auth/LoginModal'
 *   <LoginModal isOpen={open} onClose={() => setOpen(false)} />
 */
export default function LoginModal({ isOpen, onClose }) {
  const { signIn, signUp, signInWithOAuth } = useAuth()
  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!isOpen) return null

  // ── email / password ────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    setBusy(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else if (mode === 'signup') {
      setMessage({ type: 'ok', text: 'Account created — check your email to confirm.' })
    } else {
      onClose()
    }
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────

  const handleOAuth = async (provider) => {
    setBusy(true)
    setMessage(null)
    const { error } = await signInWithOAuth(provider)
    setBusy(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    }
    // On success, Supabase redirects to the provider — no need to close
  }

  const toggle = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setMessage(null)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: 20, fontWeight: 700 }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        {/* ── OAuth provider buttons ─────────────────────────────────── */}
        {OAUTH_PROVIDERS.map(({ id, label, icon }) => (
          <button
            key={id}
            style={oauthBtn}
            onClick={() => handleOAuth(id)}
            disabled={busy}
          >
            {icon}
            {label}
          </button>
        ))}

        {/* ── divider ────────────────────────────────────────────────── */}
        <div style={dividerRow}>
          <span style={dividerLine} />
          <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>or use email</span>
          <span style={dividerLine} />
        </div>

        {/* ── email / password form ──────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13 }}>
            Email
            <input
              type='email'
              style={inputStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label style={{ fontSize: 13 }}>
            Password
            <input
              type='password'
              style={inputStyle}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {message && (
            <p style={{ color: message.type === 'error' ? '#ff6b6b' : '#6bffb8', fontSize: 13, margin: '0 0 0.75rem' }}>
              {message.text}
            </p>
          )}

          <button type='submit' style={btnPrimary} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button style={btnSecondary} onClick={toggle}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, width: '100%', marginTop: '0.5rem' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
