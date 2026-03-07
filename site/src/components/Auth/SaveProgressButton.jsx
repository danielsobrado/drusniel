import React, { useState, useEffect } from 'react'
import { Box, Text } from 'theme-ui'
import { useAuth } from '@authContext/AuthContext'

/**
 * SaveProgressButton
 *
 * A bookmark icon that logged-in users can click to save the current chapter
 * as their latest reading progress. Appears inline next to the share buttons.
 *
 * Props:
 *   - path  : article path (e.g. location.pathname)
 *   - title : article title (e.g. post.title)
 */
export default function SaveProgressButton({ path, title }) {
  const { user, trackVisit, readingProgress } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Check if this article is already the saved one
  useEffect(() => {
    if (readingProgress && readingProgress.last_article_path === path) {
      setSaved(true)
    } else {
      setSaved(false)
    }
  }, [readingProgress, path])

  // Only render on client, only for logged-in users
  if (!mounted || !user) return null

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    await trackVisit(path, title)
    setSaved(true)
    setSaving(false)
  }

  return (
    <Box
      as='button'
      onClick={handleSave}
      title={saved ? 'Saved as latest read' : 'Save as latest read'}
      aria-label={saved ? 'Saved as latest read' : 'Save as latest read'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        bg: 'transparent',
        border: 'none',
        cursor: saving ? 'wait' : 'pointer',
        px: 1,
        py: 0,
        ml: 0,
        borderRadius: 'full',
        transition: 'all 200ms ease',
        color: saved ? '#6c47ff' : 'omega',
        whiteSpace: 'nowrap',
        ':hover': {
          color: saved ? '#6c47ff' : 'omegaDark',
          transform: 'scale(1.15)',
        },
      }}
    >
      {/* Bookmark SVG icon — filled when saved, outline when not */}
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill={saved ? 'currentColor' : 'none'}
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ flexShrink: 0 }}
      >
        <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
      </svg>
      <Text
        as='span'
        sx={{
          fontSize: 1,
          fontWeight: 600,
          color: saved ? '#6c47ff' : 'omegaDark',
          display: ['none', 'inline'],
          lineHeight: 1,
        }}
      >
        {saved ? 'Saved' : 'Save for later'}
      </Text>
    </Box>
  )
}
