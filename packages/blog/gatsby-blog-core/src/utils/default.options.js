const getValue = require('get-value')
const typesDefs = require('../types')

module.exports = pluginOptions => {
  const services = {
    algolia: getValue(pluginOptions, 'services.algolia', false),
    mailchimp: getValue(pluginOptions, 'services.mailchimp', true),
    disqus: getValue(pluginOptions, 'services.disqus', false),
    graphComment: getValue(pluginOptions, 'services.graphComment', false),
    facebookComment: getValue(pluginOptions, 'services.facebookComment', false)
  }

  const sources = [
    {
      name: 'mdx',
      enabled: getValue(pluginOptions, 'sources.local', true),
      extensions: getValue(pluginOptions, 'mdx.extensions', ['.mdx', '.md']),
      sourceInstanceName: 'article',
      imageNodeType: 'ImageSharp',
      typeDefs: typesDefs.file
    }
  ]

  const siteUrl = pluginOptions.siteUrl
    ? pluginOptions.siteUrl.replace(/\/$/, '')
    : null

  const basePath = pluginOptions.basePath || '/'

  const localPaths = [
    {
      name: 'article',
      path: getValue(pluginOptions, 'localPaths.post', 'content/posts')
    },
    {
      name: 'author',
      path: getValue(pluginOptions, 'localPaths.author', 'content/authors')
    },
    {
      name: 'category',
      path: getValue(pluginOptions, 'localPaths.category', 'content/categories')
    }
  ]

  const staticPaths = [
    {
      name: 'asset',
      path: getValue(pluginOptions, 'localPaths.asset', 'content/assets')
    }
  ]

  const sitePaths = {
    MdxArticleProxy: getValue(pluginOptions, 'sitePaths.article', ''),
    AuthorsJson: getValue(pluginOptions, 'sitePaths.author', '/author'),
    ArticleTag: getValue(pluginOptions, 'sitePaths.tag', '/tag'),
    CategoriesJson: getValue(pluginOptions, 'sitePaths.category', '/category')
  }

  const pagingParam = pluginOptions.pagingParam || 'page'
  const paginatePostsPage = pluginOptions.paginatePostsPage || false
  const homePostsPerPage = pluginOptions.homePostsPerPage || 6
  const collectionPostsPerPage = pluginOptions.collectionPostsPerPage || 6

  const mobileMenu = null // Will populate by: utils/queryMobileMenu.js

  const darkMode = getValue(pluginOptions, 'darkMode', true)

  const slugSanitizeRegex = getValue(pluginOptions, 'slugSanitizeRegex', null)

  const includeExcerpt = getValue(pluginOptions, 'includeExcerpt', true)
  const includeTimeToRead = getValue(pluginOptions, 'includeTimeToRead', true)
  const includeTableOfContents = getValue(
    pluginOptions,
    'includeTableOfContents',
    true
  )
  const imageQuality = getValue(pluginOptions, 'imageQuality', 85)

  const gatsbyRemarkPlugins = getValue(pluginOptions, 'gatsbyRemarkPlugins', [])
  const remarkPlugins = getValue(pluginOptions, 'remarkPlugins', [])

  const pageContextOptions = {
    paginatePostsPage,
    basePath,
    services,
    siteUrl,
    mobileMenu,
    darkMode,
    includeExcerpt,
    includeTimeToRead,
    includeTableOfContents,
    imageQuality
  }

  return {
    services,
    sources,
    siteUrl,
    basePath,
    localPaths,
    staticPaths,
    sitePaths,
    pagingParam,
    homePostsPerPage,
    paginatePostsPage,
    collectionPostsPerPage,
    slugSanitizeRegex,
    pageContextOptions,
    gatsbyRemarkPlugins,
    remarkPlugins
  }
}
