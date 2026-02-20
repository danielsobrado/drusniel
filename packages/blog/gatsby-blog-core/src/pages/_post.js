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
  
  articles.forEach((node, index) => {
    const { id, slug, language, category, tags, link } = node;
  
    if (link) return; // Skip creating pages for nodes linking to external sites
  
    const previous = index === 0 ? null : articles[index - 1];
    const next = index === articles.length - 1 ? null : articles[index + 1];
  
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
