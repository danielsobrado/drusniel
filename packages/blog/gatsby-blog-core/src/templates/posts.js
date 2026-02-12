import React, { useContext } from 'react';
import { graphql } from 'gatsby';
import PostsPage from '../containers/Posts';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const Posts = ({ data, ...props }) => {
  const { language } = useContext(LanguageContext);
  console.log('LanguageContext Posts: ' + language);

  return <PostsPage data={data} {...props} />;
};

export default Posts;

export const pageQuery = graphql`
  query PostsPageQuery(
    $paginatePostsPage: Boolean!
    $skip: Int
    $limit: Int
    $includeExcerpt: Boolean!
    $includeTimeToRead: Boolean!
    $imageQuality: Int!
  ) {
    posts: allArticle(
      filter: { private: { ne: true }, draft: { ne: true } }
      sort: { date: ASC }
      limit: 2000
    ) {
      group(field: { category: { name: SELECT } }, limit: 10) {
        categoryName: fieldValue
        nodes {
          ...ArticlePreview
          ...ArticleThumbnailRegular
          category {
            descriptiones
          }
          language
        }
      }
    }
    featuredPostsEN: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        featured: { eq: true }
        language: { eq: "en" }
      }
      sort: { date: ASC }
      limit: 10
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailFeatured
        language
      }
    }
    featuredPostsES: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        featured: { eq: true }
        language: { eq: "es" }
      }
      sort: { date: ASC }
      limit: 10
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailFeatured
        language
      }
    }
    recentPostsEN: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        language: { eq: "en" }
      }
      sort: { date: ASC }
      limit: 10
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailRegular
        language
      }
    }
    recentPostsES: allArticle(
      filter: {
        private: { ne: true }
        draft: { ne: true }
        language: { eq: "es" }
      }
      sort: { date: ASC }
      limit: 10
    ) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailRegular
        language
      }
    }
    paginatedPosts: allArticle(
      filter: { private: { ne: true }, draft: { ne: true } }
      sort: { date: ASC }
      limit: $limit
      skip: $skip
    ) @include(if: $paginatePostsPage) {
      nodes {
        ...ArticlePreview
        ...ArticleThumbnailRegular
        language
      }
      ...ArticlePagination
    }
  }
`;