import { graphql } from 'gatsby'
import Collection from '../containers/Collection.Author'

export default Collection

export const pageQuery = graphql`
  query allArticleByAuthorQuery(
    $skip: Int!
    $limit: Int!
    $slug: String!
    $includeExcerpt: Boolean!
    $includeTimeToRead: Boolean!
    $imageQuality: Int!
    $language: String!
  ) {
    collectionInfo: articleAuthor(slug: { eq: $slug }) {
      ...ArticleAuthor
    }
    posts: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        author: { slug: { eq: $slug } }
        language: { eq: $language }
      }
      sort: { date: DESC }
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