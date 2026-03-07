import { useStaticQuery, graphql } from 'gatsby';
import dedupe from 'dedupe';
import { useContext } from 'react';
import { LanguageContext } from './useLanguageContext';

export const useBlogAuthors = (godFilter = 'all') => {
  const { language } = useContext(LanguageContext);
  const { allArticleAuthor, allArticle } = useStaticQuery(graphql`
    query allArticleAuthorQuery {
      allArticleAuthor {
        nodes {
          ...ArticleAuthor
          descriptiones
          titlees
          skillses
          god
          secondary
        }
      }
      allArticle(filter: { private: { ne: true }, draft: { ne: true } }) {
        nodes {
          language
          author {
            slug
          }
        }
      }
    }
  `);

  const authors = allArticleAuthor.nodes ? dedupe(allArticleAuthor.nodes, node => node.slug) : [];
  const authorsWithPosts = new Set(
    (allArticle?.nodes || [])
      .filter(node => node?.language === language && node?.author?.slug)
      .map(node => node.author.slug)
  )

  // Filter authors based on the current language, god status, and secondary status
  const filteredAuthors = authors
    .filter(author => {
      const isObject = author.god == null && author.secondary == null;

      if (godFilter === 'gods') {
        return author.god;
      } else if (godFilter === 'notGods') {
        return author.god === false && !author.secondary;
      } else if (godFilter === 'secondary') {
        return author.secondary;
      } else if (godFilter === 'objects') {
        return isObject;
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
      hasPosts: authorsWithPosts.has(author.slug),
    }));

  return filteredAuthors;
};