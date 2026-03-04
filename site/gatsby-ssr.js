const React = require('react')

// Wrap each page element to catch and log SSR errors
exports.wrapPageElement = ({ element, props }) => {
  if (typeof window === 'undefined') {
    // SSR only - log which page is being rendered
    console.log(`[SSR] Rendering: ${props.path}`)
  }
  return element
}
