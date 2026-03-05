/**
 * gatsby-browser.js
 *
 * Composes the site-level AuthProvider around the theme's LanguageProvider.
 * Gatsby merges wrapRootElement from multiple sources, but site-level files
 * take precedence over theme-level ones, so we must re-include anything
 * the theme's gatsby-browser.js provided.
 */
import React from 'react'
import { globalHistory } from '@reach/router'
import { LanguageProvider } from '@helpers-blog/useLanguageContext'
import { AuthProvider } from './src/context/AuthContext'

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <LanguageProvider>
      {element}
    </LanguageProvider>
  </AuthProvider>
)

export const onRouteUpdate = () => {
  globalHistory.listen(args => {
    args.location.action = args.action
  })
}
