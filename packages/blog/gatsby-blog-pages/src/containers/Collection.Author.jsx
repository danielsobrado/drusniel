import React from 'react'
import { Layout, Stack, Main, PreFooter } from '@layout'
import PageTitle from '@components/PageTitle'
import Pagination from '@components/Pagination'
import CardList from '@components/CardList'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import AuthorExpanded from '@widgets/AuthorExpanded'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const PageCollectionAuthors = ({ data, ...props }) => {
  const { posts, collectionInfo } = data || {};
  const { language: contextLanguage = 'en' } = useContext(LanguageContext) || {};

  const texts = {
    en: {
      pageTitle: 'Characters',
    },
    es: {
      pageTitle: 'Personajes',
    },
  };

  const { pageTitle } = texts[contextLanguage] || texts['en'];

  return (
    <Layout {...props}>
      <Seo title={collectionInfo.name} description={collectionInfo.description} />
      <Divider />
      <Stack effectProps={{ effect: 'fadeInDown' }}>
        <PageTitle header={pageTitle} totalCount={posts.totalCount} />
      </Stack>
      <Divider />
      <Stack>
        <Main>
          <AuthorExpanded author={collectionInfo} />
          <Divider />
          {posts.nodes && (
            <CardList
            nodes={posts.nodes.map(post => ({
              ...post,
              language: post.language || contextLanguage,
            }))}
              variant={['horizontal-md', 'vertical']}
              columns={[1, 2, 3, 3]}
            />
          )}
        </Main>
      </Stack>
      <Divider />
      <PreFooter>
        <Pagination
          {...posts.pageInfo}
          {...collectionInfo}
          pathPrefix={`/${contextLanguage}${collectionInfo.slug}`}
        />
      </PreFooter>
    </Layout>
  );
};

export default PageCollectionAuthors;