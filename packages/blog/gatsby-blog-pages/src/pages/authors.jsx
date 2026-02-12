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
  const authors = useBlogAuthors('notGods')
  const { language } = useContext(LanguageContext);
  // header: 'Main Characters'
  let header = 'Main Characters';
  if (language === "es") {
    header = 'Personajes Principales';
  }
  // subheader: 'Interested in contributing? Reach out to us using the contact form. Always keen to explore and expand.'
  let subheader = 'Step into the murky world of Astalor, where characters navigate the gray edges of morality, their destinies intertwined in a grim dance of power, betrayal, and survival.';
  if (language === "es") {
    subheader = 'Entra al mundo oscuro de Astalor, donde los personajes exploran los límites oscuros de la ética, y sus vidas se entrelazan en un oscuro juego de poder, traición y supervivencia.';
  }

  return (
    <Layout {...props}>
      <Seo title='Characters' />
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
