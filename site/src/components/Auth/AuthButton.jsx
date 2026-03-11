import React, { useState, useEffect, useContext, useRef } from 'react'
import { Button, Box, Text, Flex } from 'theme-ui'
import { Link, navigate } from 'gatsby'
import {
  FaBookOpen,
  FaChevronDown,
  FaChevronUp,
  FaGlobe,
  FaRegTrashAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa'
import { useAuth } from '@authContext/AuthContext'
import { LanguageContext } from '@helpers-blog/useLanguageContext'
import pageContextProvider from '@helpers/pageContextProvider'
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
  const {
    user,
    loading,
    signOut,
    readingProgress,
    trackVisit,
    clearReadingProgress,
    updatePreferredLanguage,
    deleteAccount,
  } = useAuth()
  const { language, setLanguage } = useContext(LanguageContext)
  const context = useContext(pageContextProvider) || {}
  const [modalOpen, setModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [message, setMessage] = useState(null)
  const [currentPageTitle, setCurrentPageTitle] = useState('')
  const menuRef = useRef(null)

  const brandBlue = '#5d7ff2'
  const brandBlueSoft = 'rgba(93, 127, 242, 0.12)'
  const brandBlueSoftStrong = 'rgba(93, 127, 242, 0.18)'

  const currentPath = context.location?.pathname || ''

  const sharedButtonStyles = {
    minWidth: ['auto', null, 'auto'],
    px: [2, null, 3],
    py: 0,
    height: [36, null, 26],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: ['0.7rem', null, '0.65rem'],
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    borderRadius: ['18px', null, '13px'],
    bg: '#111111',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    flexShrink: 0,
    '&:hover': {
      bg: '#333333',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
    },
    transition: 'all 250ms ease',
  }

  const menuButtonStyles = {
    ...sharedButtonStyles,
    bg: '#f3f4f7',
    color: '#111111',
    border: '1px solid rgba(17,17,17,0.08)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    maxWidth: [`full`, null, `16rem`, `18rem`],
    px: [2, null, 2],
    height: [36, null, 26],
    '&:hover': {
      bg: '#ebedf2',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
    },
  }

  const styles = {
    wrapper: {
      position: 'relative',
      ml: [2, null, 3],
      minWidth: 0,
      flexShrink: 1,
    },
    triggerText: {
      fontSize: '0.8rem',
      fontWeight: 'bold',
      color: 'text',
      minWidth: 0,
      maxWidth: [90, 110, 140, 170],
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: ['none', null, 'block'],
      flex: '1 1 auto',
      textAlign: 'left',
      opacity: 0.9,
    },
    caret: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'omega',
      ml: 1,
      flexShrink: 0,
    },
    menu: {
      position: 'absolute',
      top: 'calc(100% + 0.5rem)',
      right: 0,
      width: ['18rem', null, '20rem'],
      maxWidth: 'calc(100vw - 2rem)',
      bg: '#ffffff',
      borderRadius: '18px',
      border: '1px solid rgba(17,17,17,0.08)',
      boxShadow: '0 24px 55px rgba(15, 23, 42, 0.18)',
      overflow: 'hidden',
      zIndex: 50,
    },
    menuHeader: {
      px: 3,
      py: 3,
      background: 'linear-gradient(135deg, rgba(93,127,242,0.12) 0%, rgba(93,127,242,0.03) 100%)',
      borderBottom: '1px solid rgba(17,17,17,0.06)',
    },
    menuBody: {
      p: 3,
    },
    section: {
      pt: 3,
      mt: 3,
      borderTop: '1px solid rgba(17,17,17,0.08)',
    },
    sectionTitle: {
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'omega',
      mb: 2,
    },
    card: {
      bg: '#f8f9fc',
      border: '1px solid rgba(17,17,17,0.06)',
      borderRadius: '14px',
      p: 2,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
    },
    cardTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 1,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: '10px',
      bg: brandBlueSoft,
      color: brandBlue,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 2,
      bg: 'transparent',
      border: '1px solid rgba(17,17,17,0.08)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      color: 'text',
      transition: 'all 150ms ease',
      ':hover': {
        bg: '#f6f7fb',
      },
      ':disabled': {
        cursor: 'wait',
        opacity: 0.7,
      },
    },
    rowButtonIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'omega',
      mr: 2,
      flexShrink: 0,
    },
    optionButton: (active) => ({
      flex: '1 1 0',
      minWidth: 0,
      minHeight: '2.5rem',
      px: 2,
      py: 2,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      lineHeight: 1,
      borderRadius: '9px',
      border: active ? `1px solid ${brandBlue}` : '1px solid rgba(17,17,17,0.08)',
      bg: active ? brandBlueSoft : 'transparent',
      color: active ? brandBlue : 'text',
      fontWeight: 700,
      cursor: active ? 'default' : 'pointer',
    }),
    helperText: {
      fontSize: '0.75rem',
      color: 'omega',
      lineHeight: 1.45,
    },
    dangerButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      px: 2,
      py: 2,
      borderRadius: '10px',
      border: '1px solid rgba(204,46,46,0.2)',
      bg: 'rgba(204,46,46,0.06)',
      color: '#b42318',
      fontWeight: 700,
      cursor: 'pointer',
      ':disabled': {
        cursor: 'wait',
        opacity: 0.7,
      },
    },
  }

  const normalizeCounterpartPath = (counterpartPath) => {
    if (!counterpartPath || typeof counterpartPath !== 'string') {
      return ''
    }

    const normalized = counterpartPath.replace(/\\/g, '/').trim()

    if (normalized.startsWith('/')) {
      const withoutIndex = normalized.replace(/\/index\.mdx?\/?$/i, '/')
      return withoutIndex.endsWith('/') ? withoutIndex : `${withoutIndex}/`
    }

    const fromContentPath = normalized
      .replace(/^site\/content\/posts\/[^/]+\/[^/]+\//i, '/')
      .replace(/\/index\.mdx?\/?$/i, '/')

    if (fromContentPath.startsWith('/')) {
      return fromContentPath.endsWith('/') ? fromContentPath : `${fromContentPath}/`
    }

    return `/${fromContentPath.replace(/^\/+/, '').replace(/\/?$/, '/')}`
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return

    const headingText = document.querySelector('main h1, article h1, h1')?.textContent?.trim()
    const documentTitle = document.title?.split('|')[0]?.trim()
    setCurrentPageTitle(headingText || documentTitle || '')
  }, [mounted, currentPath, menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const handleLanguageChange = async (targetLanguage) => {
    if (busyAction || targetLanguage === language) return

    setBusyAction('language')
    setMessage(null)

    await updatePreferredLanguage(targetLanguage)
    setLanguage(targetLanguage)

    const counterpartTarget = normalizeCounterpartPath(context.pageContext?.counterpartPath)
    if (counterpartTarget) {
      navigate(counterpartTarget)
    } else if (currentPath.startsWith('/en/')) {
      navigate(currentPath.replace('/en/', '/es/'))
    } else if (currentPath.startsWith('/es/')) {
      navigate(currentPath.replace('/es/', '/en/'))
    } else {
      navigate(targetLanguage === 'en' ? '/en/' : '/es/')
    }

    setBusyAction('')
  }

  const handleUseCurrentPage = async () => {
    if (!currentPath || busyAction) return

    setBusyAction('reading')
    setMessage(null)
    await trackVisit(currentPath, currentPageTitle || 'Latest read')
    setMessage({ type: 'ok', text: 'Latest read updated.' })
    setBusyAction('')
  }

  const handleClearLatestRead = async () => {
    if (busyAction) return

    setBusyAction('clear-reading')
    setMessage(null)
    const { error } = await clearReadingProgress()
    setMessage(
      error
        ? { type: 'error', text: error.message }
        : { type: 'ok', text: 'Latest read cleared.' }
    )
    setBusyAction('')
  }

  const handleDeleteAccount = async () => {
    if (busyAction) return

    const confirmed = window.confirm(
      'Delete this account and remove its saved reading progress? This action cannot be undone.'
    )

    if (!confirmed) return

    setBusyAction('delete')
    setMessage(null)
    const { error } = await deleteAccount()

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setBusyAction('')
      return
    }

    setMenuOpen(false)
    setBusyAction('')
  }

  const handleSignOut = async () => {
    setBusyAction('signout')
    await signOut()
    setBusyAction('')
    setMenuOpen(false)
  }

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
      <Box sx={styles.wrapper} ref={menuRef}>
        <Button sx={menuButtonStyles} onClick={() => setMenuOpen((open) => !open)}>
          <Text sx={styles.triggerText} title={user.email}>
            {user.email}
          </Text>
          <Text as='span' sx={styles.caret}>
            {menuOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
          </Text>
        </Button>

        {menuOpen && (
          <Box sx={styles.menu}>
            <Box sx={styles.menuHeader}>
              <Flex sx={{ alignItems: 'center', gap: 2 }}>
                <Box sx={{ ...styles.iconBadge, width: 40, height: 40, borderRadius: '12px' }}>
                  <FaUserCircle size={20} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Text sx={styles.sectionTitle}>Account</Text>
                  <Text
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'heading',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={user.email}
                  >
                    {user.email}
                  </Text>
                </Box>
              </Flex>
            </Box>

            <Box sx={styles.menuBody}>
              <Box sx={styles.card}>
                <Text sx={styles.sectionTitle}>Latest read</Text>
                <Box sx={styles.cardHeader}>
                  <Flex sx={{ minWidth: 0, flex: '1 1 auto', gap: 2 }}>
                    <Box sx={styles.iconBadge}>
                      <FaBookOpen size={14} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      {readingProgress ? (
                        <>
                          <Text sx={{ fontSize: '0.85rem', color: 'text', lineHeight: 1.45 }}>
                            <Link
                              to={readingProgress.last_article_path}
                              onClick={() => setMenuOpen(false)}
                              style={{ color: brandBlue, fontWeight: 700, textDecoration: 'none' }}
                            >
                              {readingProgress.last_article_title}
                            </Link>
                          </Text>
                          <Text sx={{ fontSize: '0.75rem', color: 'omega', mt: 1 }}>
                            Saved as your continue-reading target.
                          </Text>
                        </>
                      ) : (
                        <Text sx={styles.helperText}>No latest read saved yet.</Text>
                      )}
                    </Box>
                  </Flex>
                </Box>

                <Flex sx={{ gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  <Button
                    sx={{ ...styles.rowButton, width: 'auto', flex: '1 1 10rem' }}
                    onClick={handleUseCurrentPage}
                    disabled={!currentPath || busyAction === 'reading'}
                  >
                    <Flex sx={{ alignItems: 'center' }}>
                      <Box as='span' sx={styles.rowButtonIcon}>
                        <FaBookOpen size={13} />
                      </Box>
                      <span>Use this page</span>
                    </Flex>
                  </Button>
                  <Button
                    sx={{ ...styles.rowButton, width: 'auto', flex: '1 1 8rem' }}
                    onClick={handleClearLatestRead}
                    disabled={!readingProgress || busyAction === 'clear-reading'}
                  >
                    <Flex sx={{ alignItems: 'center' }}>
                      <Box as='span' sx={styles.rowButtonIcon}>
                        <FaRegTrashAlt size={13} />
                      </Box>
                      <span>Clear</span>
                    </Flex>
                  </Button>
                </Flex>
                {currentPageTitle && (
                  <Text sx={{ ...styles.helperText, mt: 2 }}>
                    Current page: {currentPageTitle}
                  </Text>
                )}
              </Box>

              <Box sx={styles.section}>
                <Box sx={styles.card}>
                  <Box sx={styles.cardTitleRow}>
                    <Box sx={styles.iconBadge}>
                      <FaGlobe size={14} />
                    </Box>
                    <Box>
                      <Text sx={styles.sectionTitle}>Preferred language</Text>
                    </Box>
                  </Box>
                  <Flex sx={{ gap: 2 }}>
                    <Button
                      sx={styles.optionButton(language === 'en')}
                      onClick={() => handleLanguageChange('en')}
                      disabled={busyAction === 'language' || language === 'en'}
                    >
                      EN
                    </Button>
                    <Button
                      sx={styles.optionButton(language === 'es')}
                      onClick={() => handleLanguageChange('es')}
                      disabled={busyAction === 'language' || language === 'es'}
                    >
                      ES
                    </Button>
                  </Flex>
                </Box>
              </Box>

              <Box sx={styles.section}>
                <Box sx={styles.card}>
                  <Box sx={styles.cardTitleRow}>
                    <Box sx={styles.iconBadge}>
                      <FaShieldAlt size={14} />
                    </Box>
                    <Box>
                      <Text sx={styles.sectionTitle}>Privacy & account</Text>
                    </Box>
                  </Box>
                  <Text sx={styles.helperText}>
                    Your account stores sign-in data and your saved reading progress. For privacy requests, contact daniel@danielsobrado.com.
                  </Text>
                  <Button
                    sx={{ ...styles.dangerButton, mt: 2 }}
                    onClick={handleDeleteAccount}
                    disabled={busyAction === 'delete'}
                  >
                    <FaRegTrashAlt size={13} />
                    <span>Delete account</span>
                  </Button>
                </Box>
              </Box>

              <Box sx={styles.section}>
                <Button
                  sx={{
                    ...styles.rowButton,
                    bg: '#111111',
                    color: '#ffffff',
                    borderColor: '#111111',
                    ':hover': {
                      bg: '#222222',
                    },
                  }}
                  onClick={handleSignOut}
                  disabled={busyAction === 'signout'}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Box as='span' sx={{ ...styles.rowButtonIcon, color: 'rgba(255,255,255,0.82)' }}>
                      <FaSignOutAlt size={13} />
                    </Box>
                    <span>Sign out</span>
                  </Flex>
                  <span>→</span>
                </Button>
              </Box>

              {message && (
                <Text
                  sx={{
                    mt: 3,
                    px: 2,
                    py: 2,
                    borderRadius: '10px',
                    bg: message.type === 'error' ? 'rgba(180,35,24,0.08)' : 'rgba(2,122,72,0.08)',
                    fontSize: '0.75rem',
                    lineHeight: 1.45,
                    color: message.type === 'error' ? '#b42318' : '#027a48',
                  }}
                >
                  {message.text}
                </Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ ml: [2, null, 3] }}>
      <Button
        sx={sharedButtonStyles}
        onClick={() => setModalOpen(true)}
      >
        Sign In
      </Button>
      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  )
}
