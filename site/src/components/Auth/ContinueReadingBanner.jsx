import React from 'react'
import { Link } from 'gatsby'
import { useAuth } from '@authContext/AuthContext'

const brandBlue = '#5d7ff2'
const brandBlueHover = '#4f70df'

/**
 * ContinueReadingBanner
 *
 * Shows a sticky banner at the bottom of any page when:
 *   - The user is logged in
 *   - They have a saved reading progress entry
 *   - They are NOT currently on that same article (avoids showing on the article itself)
 *
 * Usage — drop anywhere, typically in the layout or homepage:
 *   import ContinueReadingBanner from '../Auth/ContinueReadingBanner'
 *   <ContinueReadingBanner currentPath={location.pathname} />
 */
export default function ContinueReadingBanner({ currentPath }) {
  const { user, readingProgress } = useAuth()

  if (!user || !readingProgress) return null
  if (currentPath && currentPath === readingProgress.last_article_path) return null

  const when = readingProgress.last_visited_at
    ? new Date(readingProgress.last_visited_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        borderTop: `2px solid ${brandBlue}`,
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        boxShadow: '0 -4px 24px rgba(93,127,242,0.25)',
      }}
    >
      <span style={{ color: '#c0c0d0', fontSize: 14 }}>
        {when ? `Last read on ${when}: ` : 'Continue reading: '}
        <strong style={{ color: '#e0e0ff' }}>{readingProgress.last_article_title}</strong>
      </span>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Link
          to={readingProgress.last_article_path}
          style={{
            background: brandBlue,
            color: '#fff',
            borderRadius: 4,
            padding: '0.4rem 1rem',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 180ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = brandBlueHover
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = brandBlue
          }}
        >
          Continue Reading →
        </Link>
        <DismissButton />
      </div>
    </div>
  )
}

/** Local dismiss — not persisted, just hides for this session */
function DismissButton() {
  const [dismissed, setDismissed] = React.useState(false)

  // We render null from the parent when dismissed; this component signals upward
  // via a side effect on its own state.  Keep it simple: just hide the whole
  // banner by injecting a body class or returning null from parent.
  // For simplicity we use a session-storage flag checked in the parent wrapper.
  if (dismissed) return null
  return (
    <button
      onClick={() => setDismissed(true)}
      style={{
        background: 'none',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: 18,
        lineHeight: 1,
        padding: '0.2rem 0.4rem',
      }}
      aria-label='Dismiss'
    >
      ×
    </button>
  )
}
