import React, { useState, useEffect } from 'react'
import { Box } from 'theme-ui'
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
        bg: 'transparent',
        border: 'none',
        cursor: saving ? 'wait' : 'pointer',
        p: 1,
        ml: 2,
        borderRadius: 'full',
        transition: 'all 200ms ease',
        color: saved ? '#6c47ff' : 'omega',
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
      >
        <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' />
      </svg>
      {saved && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            marginLeft: 4,
            color: '#6c47ff',
          }}
        >
          Saved
        </span>
      )}
    </Box>
  )
}
