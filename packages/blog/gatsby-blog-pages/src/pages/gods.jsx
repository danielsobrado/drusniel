import React from 'react'
import { Layout, Stack, Main } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import AuthorExpanded from '@widgets/AuthorExpanded'
import { useContext } from 'react';
import { useBlogAuthors } from '@helpers-blog'
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const PageAuthors = props => {
  const authors = useBlogAuthors('gods'); 
  const { language } = useContext(LanguageContext);
  // header: 'Main Characters'
  let header = 'Gods of Astalor';
  if (language === "es") {
    header = 'Los dioses de Astalor';
  }
  // subheader: 'Interested in contributing? Reach out to us using the contact form. Always keen to explore and expand.'
  let subheader = 'Discover the guardians of Astalor, where ancient spirits and earthly deities guide the fortunes of lands and people, intertwined with nature unyielding forces.';
  if (language === "es") {
    subheader = 'Descubre a los guardianes de Astalor, donde espíritus ancestrales y deidades terrenales guían las fortunas de tierras y pueblos, entrelazados con las fuerzas inquebrantables de la naturaleza.';
  }

  return (
    <Layout {...props}>
      <Seo title='Gods' />
      <Divider />
      <Stack effectProps={{ effect: 'fadeInDown' }}>
      <PageTitle
          header={header}
          subheader={subheader}
        />
      </Stack>
      <Stack>
        <Main>
          {authors.map((author, i) => (
            <React.Fragment key={`item-${i}`}>
              <Divider />
              <AuthorExpanded author={author} withLink />
            </React.Fragment>
          ))}
        </Main>
      </Stack>
    </Layout>
  )
}

export default PageAuthors
