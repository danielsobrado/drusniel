import { graphql } from 'gatsby'

export const query = graphql`
  fragment ArticlePreview on Article {
    id
    title
    slug
    language
    link
    excerpt @include(if: $includeExcerpt)
    timeToRead @include(if: $includeTimeToRead)
    featured
    thumbnailText
    date(formatString: "MMMM DD, YYYY")
    chapter
    subchapter
    canon_phase
    canon_sequence
    category {
      ...ArticleCategory
    }
    author {
      ...ArticleAuthor
    }
  }
`
