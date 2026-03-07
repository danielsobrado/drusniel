import React, { useState, useEffect } from 'react'
import { Button, Box, Text } from 'theme-ui'
import { useAuth } from '@authContext/AuthContext'
import LoginModal from './LoginModal'

/**
 * AuthButton
 *
 * Drop this anywhere in your layout / header shadow component.
 * Shows "Sign In" when logged out, user email + "Sign Out" when logged in.
 * Uses theme-ui variants to match the template's design language.
 *
 * Renders nothing during SSR to avoid hydration mismatches.
 */
export default function AuthButton() {
  const { user, loading, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Render nothing during SSR and initial hydration to prevent mismatch
  if (!mounted) {
    console.log('[AuthButton] Not mounted yet (SSR or pre-hydration)')
    return null
  }
  if (loading) {
    console.log('[AuthButton] Auth state still loading...')
    return null
  }
  console.log('[AuthButton] Rendering —', user ? `logged in as ${user.email}` : 'not logged in')

  if (user) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 3, ml: [2, null, 4] }}>
        <Text
          sx={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: 'text',
            opacity: 0.8,
            maxWidth: [80, 120, 180],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: ['none', null, 'inline-block'],
          }}
        >
          {user.email}
        </Text>
        <Button
          sx={{
            minWidth: 'auto',
            px: 3,
            py: 0,
            height: 26,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            borderRadius: '13px',
            bg: '#111111', // Black button
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            '&:hover': {
              bg: '#333333',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            },
            transition: 'all 250ms ease',
          }}
          onClick={signOut}
        >
          Sign Out
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ ml: 3 }}>
      <Button
        sx={{
          minWidth: 'auto',
          px: 3,
          py: 0,
          height: 26,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          borderRadius: '13px',
          bg: '#111111', // Black button
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          '&:hover': {
            bg: '#333333',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          },
          transition: 'all 250ms ease',
        }}
        onClick={() => setModalOpen(true)}
      >
        Sign In
      </Button>
      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  )
}
