import React, { useState } from 'react'
import { Box, Flex, Heading, Text, Button, Input, Label, Divider } from 'theme-ui'
import { useAuth } from '@authContext/AuthContext'

/* ── tiny inline SVG icons (no extra dependency) ───────────────────── */
const GoogleIcon = () => (
  <svg width='18' height='18' viewBox='0 0 48 48' style={{ marginRight: 8, flexShrink: 0 }}>
    <path fill='#EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/>
    <path fill='#4285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/>
    <path fill='#FBBC05' d='M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.08 24.08 0 0 0 0 21.56l7.98-6.19z'/>
    <path fill='#34A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/>
  </svg>
)

const GitHubIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' style={{ marginRight: 8, flexShrink: 0 }}>
    <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z'/>
  </svg>
)

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

  const toggle = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setMessage(null)
  }

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        bg: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          variant: 'cards.primary',
          p: 4,
          width: 400,
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <Heading as='h2' variant='h2' sx={{ mb: 4, fontSize: 4, textAlign: 'center' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Heading>

        {/* ── OAuth buttons ──────────────────────────────────────────── */}
        <Button
          onClick={() => signInWithOAuth('google')}
          sx={{
            width: '100%',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'white',
            color: '#333',
            border: '1px solid',
            borderColor: 'gray.3',
            borderRadius: 'default',
            fontWeight: 600,
            fontSize: 1,
            cursor: 'pointer',
            ':hover': { bg: 'gray.1' },
          }}
        >
          <GoogleIcon /> Continue with Google
        </Button>

        <Button
          onClick={() => signInWithOAuth('github')}
          sx={{
            width: '100%',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: '#24292e',
            color: 'white',
            borderRadius: 'default',
            fontWeight: 600,
            fontSize: 1,
            cursor: 'pointer',
            ':hover': { bg: '#1a1e22' },
          }}
        >
          <GitHubIcon /> Continue with GitHub
        </Button>

        <Flex sx={{ alignItems: 'center', mb: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Text sx={{ px: 3, fontSize: 0, color: 'omega' }}>or</Text>
          <Divider sx={{ flex: 1 }} />
        </Flex>

        {/* ── email / password form ──────────────────────────────────── */}
        <Box as='form' onSubmit={handleSubmit}>
          <Label htmlFor='auth-email' sx={{ mb: 1, fontSize: 1, color: 'heading' }}>
            Email
          </Label>
          <Input
            id='auth-email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Label htmlFor='auth-password' sx={{ mb: 1, fontSize: 1, color: 'heading' }}>
            Password
          </Label>
          <Input
            id='auth-password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            sx={{ mb: 3 }}
          />

          {message && (
            <Text
              sx={{
                color: message.type === 'error' ? 'error' : 'success',
                fontSize: 1,
                mb: 3,
              }}
            >
              {message.text}
            </Text>
          )}

          <Button type='submit' variant='primary' disabled={busy} sx={{ width: '100%', mb: 2 }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </Box>

        <Button variant='mute' onClick={toggle} sx={{ width: '100%', mb: 2, fontSize: 1, mt: 2 }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Button>

        <Text
          as='button'
          onClick={onClose}
          sx={{
            display: 'block',
            mx: 'auto',
            bg: 'transparent',
            border: 'none',
            color: 'omega',
            cursor: 'pointer',
            fontSize: 0,
            textAlign: 'center',
            mt: 2,
            ':hover': { color: 'omegaDark' },
          }}
        >
          Cancel
        </Text>
      </Box>
    </Box>
  )
}
