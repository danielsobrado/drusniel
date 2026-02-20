import React from 'react'
import { Layout, Stack, Main, Sidebar } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import ContactForm from '@widgets/ContactForm'
import ContactInfo from '@widgets/ContactInfo'
import Commitment from '@widgets/Commitment'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const PageContact = props => {
  const { language } = useContext(LanguageContext);
  
  let header = "Let's Connect";
  if (language === "es") {
    header = "Conectemos";
  }
  
  let subheader = "Interested in hiring me for freelance work?, looking for a cooperative partnership?, or just wanting to engage in insightful discussion? I'm always open for conversation - let's connect!";
  if (language === "es") {
    subheader = "¿Interesado en contratarme para trabajo freelance?, ¿Buscas una asociación cooperativa?, ¿O simplemente deseas participar en una discusión interesante? Siempre estoy abierto a la conversación - ¡Conectemos!";
  }

  return (
    <Layout {...props}>
      <Seo title='Contact' />
      <Divider />
      <Stack>
        <Main>
        <PageTitle
            header={header}
            subheader={subheader}
          />
          <Divider />
          <ContactForm />
        </Main>
        <Sidebar>
          <Commitment />
          <Divider />
          <ContactInfo />
        </Sidebar>
      </Stack>
    </Layout>
  )
}

export default PageContact
