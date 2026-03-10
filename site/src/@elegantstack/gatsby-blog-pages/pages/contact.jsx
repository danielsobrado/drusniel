import React, { useContext } from 'react'
import { Link } from 'gatsby'
import { Box, Text } from 'theme-ui'
import { Layout, Stack, Main, Sidebar } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import ContactForm from '@widgets/ContactForm'
import ContactInfo from '@widgets/ContactInfo'
import Commitment from '@widgets/Commitment'
import { LanguageContext } from '@helpers-blog/useLanguageContext'

const styles = {
  aboutBox: {
    bg: '#f8f9fc',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '18px',
    p: 3,
    mb: 4,
  },
  aboutLink: {
    color: '#5d7ff2',
    textDecoration: 'none',
    fontWeight: 700,
    ':hover': {
      textDecoration: 'underline',
    },
  },
}

const PageContact = (props) => {
  const { language } = useContext(LanguageContext)

  const header = language === 'es' ? 'Conectemos' : "Let's Connect"
  const subheader = language === 'es'
    ? '¿Interesado en contratarme para trabajo freelance?, ¿Buscas una asociación cooperativa?, ¿O simplemente deseas participar en una discusión interesante? Siempre estoy abierto a la conversación - ¡Conectemos!'
    : "Interested in hiring me for freelance work?, looking for a cooperative partnership?, or just wanting to engage in insightful discussion? I'm always open for conversation - let's connect!"

  const aboutLine = language === 'es'
    ? 'Si quieres conocer mejor el origen de Drusniel, '
    : 'If you want to know more about the origin of Drusniel, '

  const aboutLinkLabel = language === 'es' ? 'lee la página sobre mí.' : 'read the about page.'
  const discordLine = language === 'es'
    ? 'Si quieres unirte a la comunidad, '
    : 'If you want to join the community, '
  const discordLinkLabel = language === 'es' ? 'entra en nuestro Discord.' : 'join our Discord.'

  return (
    <Layout {...props}>
      <Seo title='Contact' />
      <Divider />
      <Stack>
        <Main>
          <PageTitle header={header} subheader={subheader} />
          <Divider />

          <Box sx={styles.aboutBox}>
            <Text sx={{ color: 'omegaDark', lineHeight: 1.7 }}>
              {aboutLine}
              <Link to='/about/' style={{ textDecoration: 'none' }}>
                <Box as='span' sx={styles.aboutLink}>{aboutLinkLabel}</Box>
              </Link>
            </Text>
            <Text sx={{ color: 'omegaDark', lineHeight: 1.7, mt: 2 }}>
              {discordLine}
              <a
                href='https://discord.gg/DfzAacZC'
                target='_blank'
                rel='noopener noreferrer'
                style={{ textDecoration: 'none' }}
              >
                <Box as='span' sx={styles.aboutLink}>{discordLinkLabel}</Box>
              </a>
            </Text>
          </Box>

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