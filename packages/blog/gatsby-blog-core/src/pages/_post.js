const queryMobileMenu = require('../utils/queryMobileMenu')

module.exports = async (
  { graphql, actions, reporter },
  pluginOptions,
  { template, mobileMenu }
) => {
  const { createPage } = actions
  const { pageContextOptions } = pluginOptions

  pageContextOptions.mobileMenu = mobileMenu

  console.log('pluginOptions', pluginOptions)

  const result = await graphql(`
    {
      allArticle(
        filter: { draft: { ne: true } }
        sort: [{ date: ASC }, { title: ASC }]
        limit: 2000
      ) {
        edges {
          node {
            id
            title
            order
            slug
            language
            link
            category {
              id
            }
            tags {
              id
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panic(result.errors);
  }
  
  const articles = result.data.allArticle.edges.map(edge => edge.node);
  articles.sort((a, b) => a.order - b.order);

  // Validate frontmatter data before creating pages
  let warnings = 0
  articles.forEach((node) => {
    const { id, slug, title, language, order, category, tags } = node;
    const label = `"${title || 'UNTITLED'}" (slug: ${slug}, order: ${order})`
    if (!slug) {
      reporter.warn(`[frontmatter] ${label} — missing slug`)
      warnings++
    }
    if (!title) {
      reporter.warn(`[frontmatter] ${label} — missing title`)
      warnings++
    }
    if (!language) {
      reporter.warn(`[frontmatter] ${label} — missing language`)
      warnings++
    }
    if (order == null) {
      reporter.warn(`[frontmatter] ${label} — missing order`)
      warnings++
    }
    if (!category) {
      reporter.warn(`[frontmatter] ${label} — missing category`)
      warnings++
    }
  })

  console.log(`[createPages] ${articles.length} articles found, ${warnings} frontmatter warnings`)

  // Group articles by language for correct previous/next navigation
  const articlesByLanguage = {}
  articles.forEach(node => {
    const lang = node.language || 'en'
    if (!articlesByLanguage[lang]) articlesByLanguage[lang] = []
    articlesByLanguage[lang].push(node)
  })

  articles.forEach((node) => {
    const { id, slug, language, category, tags, link } = node;
  
    if (link) return; // Skip creating pages for nodes linking to external sites
  
    // Find previous/next within same language only
    const langArticles = articlesByLanguage[language || 'en'] || []
    const langIndex = langArticles.findIndex(a => a.id === id)
    const previous = langIndex > 0 ? langArticles[langIndex - 1] : null
    const next = langIndex < langArticles.length - 1 ? langArticles[langIndex + 1] : null
  
    // For querying related posts based on tags and category
    const categoryId = category && category.id;
    const tagsIds = (tags && tags.map(tag => tag && tag.id)) || [];
    const hasTags = tagsIds.length > 0;
  
    createPage({
      path: slug,
      language: language, 
      component: template,
      context: {
        id,
        categoryId,
        language, 
        tagsIds,
        hasTags,
        previousId: previous ? previous.id : undefined,
        nextId: next ? next.id : undefined,
        ...pageContextOptions
      }
    })
  })
}
