/**
 * gatsby-ssr.js
 *
 * Mirrors gatsby-browser.js so the provider tree matches during SSR.
 */
import React from 'react'
import { LanguageProvider } from '@helpers-blog/useLanguageContext'
import { AuthProvider } from './src/context/AuthContext'

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <LanguageProvider>
      {element}
    </LanguageProvider>
  </AuthProvider>
)
