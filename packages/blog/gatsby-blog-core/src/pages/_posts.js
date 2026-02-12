const urljoin = require('url-join')
const normalizeSlug = require('../utils/normalizeSlug')
const queryMobileMenu = require('../utils/queryMobileMenu')

module.exports = async (
  { graphql, actions, reporter },
  pluginOptions,
  { template, mobileMenu }
) => {
  const { createPage } = actions
  const {
    basePath,
    paginatePostsPage,
    homePostsPerPage,
    pagingParam,
    pageContextOptions
  } = pluginOptions

  pageContextOptions.mobileMenu = mobileMenu

  const languages = ['en', 'es']; // Add your supported languages here

  // Create the landing page
  createPage({
    path: basePath,
    component: template,
    context: {
      ...pageContextOptions,
      language: 'en' // Set the default language for the landing page
    }
  })

  for (const language of languages) {
    // Create pagination for posts page if required
    if (paginatePostsPage) {
      const result = await graphql(`
        query PostsPageQuery($language: String!) {
          allArticle(
            limit: ${homePostsPerPage}
            filter: {
              private: { ne: true }
              draft: { ne: true }
              language: { eq: $language }
            }
          ) {
            pageInfo {
              pageCount
            }
          }
        }
      `, { language });

      if (result.errors) {
        reporter.panic(result.errors)
      }

      const { pageInfo } = result.data.allArticle

      Array.from({ length: pageInfo.pageCount }, (_, i) => {
        let path = i === 0
          ? `/${language}${basePath}`
          : urljoin(`/${language}${basePath}`, pagingParam, `${i + 1}`)
        path = normalizeSlug(path)

        createPage({
          path,
          component: template,
          context: {
            limit: homePostsPerPage,
            skip: i * homePostsPerPage,
            language,
            ...pageContextOptions
          }
        })
      })
    }
    // Single posts page without pagination
    else {
      const postPath = `/${language}${basePath}`;

      createPage({
        path: postPath,
        component: template,
        context: {
          language,
          ...pageContextOptions
        }
      })
    }
  }
}