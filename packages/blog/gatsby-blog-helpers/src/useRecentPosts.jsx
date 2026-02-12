import { useStaticQuery, graphql } from 'gatsby'
import { useContext } from 'react'
import { LanguageContext } from './useLanguageContext'

export const useRecentPosts = () => {
  const { language } = useContext(LanguageContext)
  const { recentPosts } = useStaticQuery(
    graphql`
      query allRecentArticleQuery(
        $includeExcerpt: Boolean! = true
        $includeTimeToRead: Boolean! = true
        $imageQuality: Int! = 85
        $language: String! = "en"
      ) {
        recentPosts: allArticle(
          filter: { private: { ne: true }, draft: { ne: true }, language: { eq: $language } }
          sort: { date: ASC }
          limit: 6
        ) {
          nodes {
            ...ArticlePreview
            ...ArticleThumbnailRegular
          }
        }
      }
    `
  )
  return recentPosts.nodes || null
}