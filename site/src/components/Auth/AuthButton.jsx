import React, { useState } from 'react'
import { useAuth } from '@authContext/AuthContext'
import LoginModal from './LoginModal'

const btn = {
  background: 'transparent',
  border: '1px solid currentColor',
  borderRadius: 4,
  cursor: 'pointer',
  padding: '0.35rem 0.9rem',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1,
}

/**
 * AuthButton
 *
 * Drop this anywhere in your layout / header shadow component.
 * Shows "Sign In" when logged out, user email + "Sign Out" when logged in.
 *
 * Example:
 *   import AuthButton from '../../components/Auth/AuthButton'
 *   <AuthButton />
 */
export default function AuthButton({ style }) {
  const { user, loading, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', ...style }}>
        <span style={{ fontSize: 12, opacity: 0.7, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </span>
        <button style={btn} onClick={signOut}>Sign Out</button>
      </span>
    )
  }

  return (
    <>
      <button style={{ ...btn, ...style }} onClick={() => setModalOpen(true)}>
        Sign In
      </button>
      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
