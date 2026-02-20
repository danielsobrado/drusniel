const withDefaults = require('./utils/default.options')
const createPostsPage = require('./pages/_posts')
const createPostPage = require('./pages/_post')
const createCollectionPage = require('./pages/_collection')
const path = require('path')

module.exports = async ({ actions, graphql, reporter }, pluginOptions) => {
  pluginOptions = withDefaults(pluginOptions)

  const { data: mobileMenuData } = await graphql(`
    {
      allArticleCategory {
        nodes {
          name
          slug
        }
      }
    }
  `)

  const mobileMenu = await require('./utils/queryMobileMenu')({
    data: mobileMenuData,
    language: 'en',
    setLanguage: (newLanguage) => {
      // Handle language change logic here
      console.log('Language changed to:', newLanguage);
  
      // Update the language in the context
      const { setLanguage } = require('./src/helpers-blog/useLanguageContext').LanguageContext._currentValue;
      setLanguage(newLanguage);
  
      // Redirect to the new language version of the current page
      const currentPath = window.location.pathname;
      const newPath = `/${newLanguage}${currentPath.slice(3)}`;
      window.location.href = newPath;
    },
    closeMenu: () => {
      // Close the mobile menu
      document.body.classList.remove('menu-open');
    },
  });
  
  /**
   * Posts (home) page
   */
  await createPostsPage({ actions, graphql, reporter }, pluginOptions, {
    template: require.resolve('./templates/posts'),
    mobileMenu,
  })

  /**
   * Single post pages
   */
  await createPostPage({ actions, graphql, reporter }, pluginOptions, {
    template: require.resolve('./templates/post'),
    mobileMenu,
  })

  const languages = ['en', 'es']

  /**
   * Category posts pages
   */
  const { data: categoryData } = await graphql(`
    query {
      allArticle {
        group(field: { category: { slug: SELECT } }) {
          fieldValue
          nodes {
            id
            language
          }
        }
      }
    }
  `)

  const categories = categoryData.allArticle.group

  categories.forEach((category) => {
    const { fieldValue: slug, nodes } = category

    languages.forEach((language) => {
      const filteredNodes = nodes.filter((node) => node.language === language)
      const totalCount = filteredNodes.length
      const postsPerPage = 10
      const numPages = Math.ceil(totalCount / postsPerPage)

      Array.from({ length: numPages }).forEach((_, i) => {
        const currentPage = i + 1
        const skip = i * postsPerPage

        actions.createPage({
          path: i === 0 ? `/${language}${slug}` : `/${language}${slug}page/${currentPage}`,
          component: path.resolve(__dirname, './templates/collection.category.js'),
          context: {
            slug,
            limit: postsPerPage,
            skip,
            numPages,
            currentPage,
            mobileMenu,
            includeExcerpt: true,
            includeTimeToRead: true,
            imageQuality: 85,
            language,
          },
        })
      })
    })
  })

  /**
   * Tag posts pages
   */
  const { data: tagData } = await graphql(`
    query {
      allArticle {
        group(field: { tags: { slug: SELECT } }) {
          fieldValue
          nodes {
            id
            language
          }
        }
      }
    }
  `)

  const tags = tagData.allArticle.group

  tags.forEach((tag) => {
    const { fieldValue: slug, nodes } = tag

    languages.forEach((language) => {
      const filteredNodes = nodes.filter((node) => node.language === language)
      const totalCount = filteredNodes.length
      const postsPerPage = 10
      const numPages = Math.ceil(totalCount / postsPerPage)

      Array.from({ length: numPages }).forEach((_, i) => {
        const currentPage = i + 1
        const skip = i * postsPerPage

        actions.createPage({
          path: i === 0 ? `/${language}${slug}` : `/${language}${slug}page/${currentPage}`,
          component: path.resolve(__dirname, './templates/collection.tag.js'),
          context: {
            slug,
            limit: postsPerPage,
            skip,
            numPages,
            currentPage,
            mobileMenu,
            includeExcerpt: true,
            includeTimeToRead: true,
            imageQuality: 85,
            language,
          },
        })
      })
    })
  })

  /**
   * Author posts pages
   */
  const { data: authorData } = await graphql(`
    query {
      allArticle {
        group(field: { author: { slug: SELECT } }) {
          fieldValue
          nodes {
            id
            language
          }
        }
      }
    }
  `)

  const authors = authorData.allArticle.group

  authors.forEach((author) => {
    const { fieldValue: slug, nodes } = author

    languages.forEach((language) => {
      const filteredNodes = nodes.filter((node) => node.language === language)
      const totalCount = filteredNodes.length
      const postsPerPage = 10
      const numPages = Math.ceil(totalCount / postsPerPage)

      Array.from({ length: numPages }).forEach((_, i) => {
        const currentPage = i + 1
        const skip = i * postsPerPage

        actions.createPage({
          path: i === 0 ? `/${language}${slug}` : `/${language}${slug}page/${currentPage}`,
          component: path.resolve(__dirname, './templates/collection.author.js'),
          context: {
            slug,
            limit: postsPerPage,
            skip,
            numPages,
            currentPage,
            mobileMenu,
            includeExcerpt: true,
            includeTimeToRead: true,
            imageQuality: 85,
            language
          },
        })
      })
    })
  })
}