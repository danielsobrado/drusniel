import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext(null)

/**
 * AuthProvider
 * Wraps the entire Gatsby application (via gatsby-browser.js / gatsby-ssr.js).
 * Exposes:
 *   - user          : current Supabase User object (or null)
 *   - session       : current Supabase Session (or null)
 *   - loading       : true while the initial session is being resolved
 *   - signIn(email, password) → { error }
 *   - signUp(email, password) → { error }
 *   - signInWithOAuth(provider) → { error }  (provider: 'google' | 'github' | 'discord' | etc.)
 *   - signOut()     → void
 *   - readingProgress : { last_article_path, last_article_title, last_visited_at } | null
 *   - trackVisit(path, title) → void  (call from article pages)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(null)

  // ─── helpers ────────────────────────────────────────────────────────────────

  const fetchReadingProgress = useCallback(async (userId) => {
    if (!supabase || !userId) return
    const { data, error } = await supabase
      .from('reading_progress')
      .select('last_article_path, last_article_title, last_visited_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (!error && data) setReadingProgress(data)
  }, [])

  // ─── auth state listener ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Restore existing session on first render
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchReadingProgress(s.user.id)
      setLoading(false)
    })

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          fetchReadingProgress(s.user.id)
        } else {
          setReadingProgress(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchReadingProgress])

  // ─── public API ─────────────────────────────────────────────────────────────

  const signIn = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  /**
   * OAuth sign-in via a third-party provider.
   * Supabase redirects the user to the provider's consent screen and back.
   *
   * Supported providers (must also be enabled in Supabase Dashboard → Auth → Providers):
   *   'google', 'github', 'discord', 'twitter', 'facebook', 'apple', 'azure', etc.
   *
   * The redirect URL is taken from GATSBY_SITE_URL (production) or defaults
   * to the current origin so it works in local dev as well.
   */
  const signInWithOAuth = async (provider) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const redirectTo =
      (typeof window !== 'undefined' && window.location.origin) ||
      process.env.GATSBY_SITE_URL ||
      'http://localhost:8000'
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    return { error }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  /**
   * Call this from any article page to record the user's latest read.
   * Uses upsert so only one row per user exists in reading_progress.
   */
  const trackVisit = useCallback(async (path, title) => {
    if (!supabase || !user) return
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          last_article_path: path,
          last_article_title: title,
          last_visited_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
    if (!error) {
      setReadingProgress({ last_article_path: path, last_article_title: title, last_visited_at: now })
    }
  }, [user])

  // ─── context value ───────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signInWithOAuth, signOut, readingProgress, trackVisit }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/** Hook — use inside any React component */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
