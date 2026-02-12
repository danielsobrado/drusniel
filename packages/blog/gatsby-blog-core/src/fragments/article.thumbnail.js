import { graphql } from 'gatsby'

export const query = graphql`
  fragment ArticleThumbnailRegular on Article {
    thumbnail {
      __typename
      ... on ImageSharp {
        ImageSharp_vertical: gatsbyImageData(
          width: 380
          height: 290
          transformOptions: { cropFocus: CENTER }
          outputPixelDensities: [0.5, 1]
          quality: $imageQuality
        )
        ImageSharp_hero: gatsbyImageData(
          width: 1600
          height: 650
          transformOptions: { cropFocus: CENTER }
          outputPixelDensities: [0.5, 1]
          quality: $imageQuality
        )
      }
    }
  }
  fragment ArticleThumbnailFeatured on Article {
    thumbnail {
      __typename
      ... on ImageSharp {
        ImageSharp_vertical: gatsbyImageData(
          width: 360
          height: 470
          transformOptions: { cropFocus: CENTER }
          outputPixelDensities: [0.5, 1]
          quality: $imageQuality
        )
        ImageSharp_horizontal: gatsbyImageData(
          width: 807
          height: 400
          transformOptions: { cropFocus: CENTER }
          outputPixelDensities: [0.5, 1]
          quality: $imageQuality
        )
        ImageSharp_hero: gatsbyImageData(
          width: 1600
          height: 650
          transformOptions: { cropFocus: CENTER }
          outputPixelDensities: [0.5, 1]
          quality: $imageQuality
        )
      }
    }
  }
`
