const urljoin = require('url-join')
const normalizeSlug = require('../utils/normalizeSlug')
const queryMobileMenu = require('../utils/queryMobileMenu')

module.exports = async (
  { actions, reporter },
  pluginOptions,
  { template, slugField, data, mobileMenu }
) => {
  const { createPage } = actions
  const { collectionPostsPerPage, pagingParam, pageContextOptions } = pluginOptions

  pageContextOptions.mobileMenu = mobileMenu

  const { allArticle } = data
  const { group } = allArticle

  group.forEach(({ pageInfo, fieldValue: slug }) => {
    Array.from({ length: pageInfo.pageCount }, (_, i) => {
      let basePath = `/articles/${slug}`;
      let path = i === 0 ? basePath : urljoin(basePath, pagingParam, `${i + 1}`);
      path = normalizeSlug(path)

      createPage({
        path,
        component: template,
        context: {
          slug,
          limit: collectionPostsPerPage,
          skip: i * collectionPostsPerPage,
          collectionType: slugField.slice(0, slugField.indexOf('_')),
          language,
          ...pageContextOptions
        }
      })
    })
  })
}