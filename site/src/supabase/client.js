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

// Singleton — only created when valid credentials are present.
export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
