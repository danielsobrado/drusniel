import { useStaticQuery, graphql } from 'gatsby';
import dedupe from 'dedupe';
import { useContext } from 'react';
import { LanguageContext } from './useLanguageContext';

export const useBlogCategories = () => {
  const { language } = useContext(LanguageContext);
  const { allArticleCategory } = useStaticQuery(categoriesQuery);

  const categories = allArticleCategory.nodes ? dedupe(allArticleCategory.nodes, node => node.slug) : [];

  // Filter categories based on the current language
  const filteredCategories = categories.map(category => ({
    ...category,
    description: language === 'es' ? category.descriptiones || category.description : category.description,
    slug: `/${language}${category.slug}`,
  }));

  return filteredCategories;
};

const categoriesQuery = graphql`
  query allArticleCategoryQuery {
    allArticleCategory {
      nodes {
        ...ArticleCategory
        namees
        descriptiones
      }
    }
  }
`;