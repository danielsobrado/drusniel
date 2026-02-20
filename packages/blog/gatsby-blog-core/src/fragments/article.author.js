import { graphql } from 'gatsby'

export const query = graphql`
  fragment ArticleAuthor on ArticleAuthor {
    id
    name
    slug
    title
    description
    skills
    social {
      name
      url
    }
    thumbnail {
      __typename
      ... on ImageSharp {
        ImageSharp_small: gatsbyImageData(
          width: 48
          height: 48
          layout: FIXED
          transformOptions: { cropFocus: NORTH }
          placeholder: BLURRED
          quality: 75
        )
        ImageSharp_regular: gatsbyImageData(
          width: 150
          height: 150
          layout: FIXED
          transformOptions: { cropFocus: NORTH }
          placeholder: BLURRED
          quality: 80
        )
      }
    }
  }
`
