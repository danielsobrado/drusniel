import { useStaticQuery, graphql } from 'gatsby';
import dedupe from 'dedupe';
import { useContext } from 'react';
import { LanguageContext } from './useLanguageContext';

export const useBlogAuthors = (godFilter = 'all') => {
  const { language } = useContext(LanguageContext);
  const { allArticleAuthor } = useStaticQuery(graphql`
    query allArticleAuthorQuery {
      allArticleAuthor {
        nodes {
          ...ArticleAuthor
          descriptiones
          titlees
          skillses
          god
        }
      }
    }
  `);

  const authors = allArticleAuthor.nodes ? dedupe(allArticleAuthor.nodes, node => node.slug) : [];

  // Filter authors based on the current language and god status
  const filteredAuthors = authors
    .filter(author => {
      if (godFilter === 'gods') {
        return author.god;
      } else if (godFilter === 'notGods') {
        return !author.god;
      } else {
        return true;
      }
    })
    .map(author => ({
      ...author,
      description: language === 'es' ? author.descriptiones || author.description : author.description,
      title: language === 'es' ? author.titlees || author.title : author.title,
      skills: language === 'es' ? author.skillses || author.skills : author.skills,
      slug: `/${language}${author.slug}`,
    }));

  return filteredAuthors;
};