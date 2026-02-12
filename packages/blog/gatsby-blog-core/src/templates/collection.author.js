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
    $language: String! ="en"
  ) {
    collectionInfo: articleAuthor(slug: { eq: $slug }) {
      ...ArticleAuthor
      id
      name
      slug
      description
      descriptiones
      skills
      skillses
    }
    posts: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        author: { slug: { eq: $slug } }
        language: { eq: $language }
      }
      sort: { date: ASC }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailRegular
        language
      }
      ...ArticlePagination
    }
  }
`