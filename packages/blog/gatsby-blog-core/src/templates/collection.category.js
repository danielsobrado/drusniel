import { graphql } from 'gatsby'
import Collection from '../containers/Collection'

export default Collection

export const pageQuery = graphql`
  query allArticleByCategoryQuery(
    $skip: Int!
    $limit: Int!
    $slug: String!
    $includeExcerpt: Boolean!
    $includeTimeToRead: Boolean!
    $imageQuality: Int!
    $language: String!
  ) {
    collectionInfo: articleCategory(slug: { eq: $slug }) {
      id
      name
      namees
      slug
      description
      descriptiones
    }
    posts: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        category: { slug: { eq: $slug } }
        language: { eq: $language }
      }
      sort: { date: ASC }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailRegular
      }
      ...ArticlePagination
    }
  }
`