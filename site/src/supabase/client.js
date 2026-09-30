import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.GATSBY_SUPABASE_URL
const supabaseAnonKey = process.env.GATSBY_SUPABASE_ANON_KEY

/**
 * Basic validation — reject missing values, placeholder text, and malformed URLs.
 */
function isValidConfig(url, key) {
  if (!url || !key) return false
  if (url.includes('<') || url.includes('>')) return false   // placeholder
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const configured = isValidConfig(supabaseUrl, supabaseAnonKey)

if (!configured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase] Missing or invalid GATSBY_SUPABASE_URL / GATSBY_SUPABASE_ANON_KEY. ' +
    'Authentication and reading progress will be disabled.'
  )
}

// Singleton — only created in the browser when valid credentials are present.
// Skipped during SSR: supabase-js's realtime client requires a native
// WebSocket, which Node < 22 lacks, and auth is client-only anyway.
export const supabase = configured && typeof window !== 'undefined'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
