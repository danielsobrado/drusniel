import React from 'react'
import { Link } from 'gatsby'
import { Box, Button, Flex, Grid, Heading, Text } from 'theme-ui'
import { Layout, Stack, Main } from '@layout'
import Divider from '@components/Divider'
import PageTitle from '@components/PageTitle'
import Seo from '@widgets/Seo'
import { LanguageContext } from '@helpers-blog/useLanguageContext'

const copy = {
  en: {
    seo: 'About Me',
    title: 'About Me',
    subtitle:
      'A small introduction to the creator behind Drusniel, how the project came to life, and where the story is heading next.',
    intro:
      'I created Drusniel because this story had lived in my head for a long time. The plot is mine, the characters are mine, and for years I wanted to give that world a proper form. I am an engineer, and thanks to AI and a wide range of automations, I have been able to bring to life the story I wanted to tell but could not fully build before.',
    imageAlt: 'Welcome to Drusniel',
    cardOneTitle: 'Why this project exists',
    cardOneBody:
      'Drusniel exists because I did not want the story to remain only an idea. I wanted a place where the central narrative, the world, and the characters could grow together in a format that readers can follow over time.',
    cardTwoTitle: 'What you will find here',
    cardTwoBody:
      'You will find the main story, lore, visual references, and an expanding set of side stories that give more space to secondary characters. The world keeps opening outward instead of standing still.',
    cardThreeTitle: 'How I approach the work',
    cardThreeBody:
      'I see Drusniel as a living project. It improves regularly, evolves with new ideas, and keeps growing in depth. The goal is not only to finish one book, but to keep building the wider story with Book Two already on the way.',
    ctaPrimary: 'Start reading',
    ctaSecondary: 'Open contact page',
  },
  es: {
    seo: 'Sobre mí',
    title: 'Sobre mí',
    subtitle:
      'Una pequeña introducción al creador detrás de Drusniel, a cómo nació el proyecto y hacia dónde se dirige la historia.',
    intro:
      'Creé Drusniel porque llevaba mucho tiempo viviendo en mi cabeza. El plot es mío, los personajes son míos, y durante años quise darle forma real a ese mundo. Soy ingeniero, y gracias a la IA y a muchas automatizaciones he podido dar vida a la historia que quería contar y que antes no podía desarrollar como quería.',
    imageAlt: 'Bienvenido a Drusniel',
    cardOneTitle: 'Por qué existe este proyecto',
    cardOneBody:
      'Drusniel existe porque no quería que la historia se quedara solo como una idea. Quería un espacio donde la narrativa principal, el mundo y los personajes pudieran crecer juntos en un formato que los lectores puedan seguir con el tiempo.',
    cardTwoTitle: 'Qué encontrarás aquí',
    cardTwoBody:
      'Aquí encontrarás la historia principal, lore, referencias visuales y un conjunto cada vez mayor de historias laterales para dar más espacio a los personajes secundarios. Es un mundo que sigue abriéndose en lugar de quedarse quieto.',
    cardThreeTitle: 'Cómo abordo el trabajo',
    cardThreeBody:
      'Veo Drusniel como un proyecto vivo. Mejora cada poco, evoluciona con nuevas ideas y sigue creciendo en profundidad. El objetivo no es solo terminar un libro, sino seguir construyendo la historia más amplia, con el libro dos ya en camino.',
    ctaPrimary: 'Empezar a leer',
    ctaSecondary: 'Abrir contacto',
  },
}

const styles = {
  heroCard: {
    bg: '#f8f9fc',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '24px',
    p: [3, 4],
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)',
    mb: 4,
  },
  imageWrap: {
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(17,17,17,0.08)',
    bg: '#ffffff',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
    img: {
      width: '100%',
      display: 'block',
      height: 'auto',
    },
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: ['1fr', null, 'repeat(3, minmax(0, 1fr))'],
    gap: 3,
    mb: 4,
  },
  infoCard: {
    bg: '#ffffff',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '20px',
    p: 3,
    boxShadow: '0 16px 32px rgba(15, 23, 42, 0.05)',
    minWidth: 0,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    mt: 3,
  },
  primaryButton: {
    bg: '#6c47ff',
    color: '#fff',
    textDecoration: 'none',
    ':hover': {
      bg: '#5937df',
    },
  },
  secondaryButton: {
    bg: 'transparent',
    color: 'heading',
    border: '1px solid rgba(17,17,17,0.12)',
    textDecoration: 'none',
    ':hover': {
      borderColor: '#6c47ff',
      color: '#6c47ff',
    },
  },
}

const AboutPage = (props) => {
  const { language } = React.useContext(LanguageContext)
  const texts = copy[language === 'es' ? 'es' : 'en']

  return (
    <Layout {...props}>
      <Seo title={texts.seo} />
      <Divider />
      <Stack>
        <Main>
          <PageTitle header={texts.title} subheader={texts.subtitle} />

          <Box sx={styles.heroCard}>
            <Grid gap={4} columns={[1, null, '1.1fr 0.9fr']}>
              <Flex sx={{ flexDirection: 'column', justifyContent: 'center' }}>
                <Text sx={{ fontSize: 3, color: 'omegaDark', lineHeight: 1.75 }}>
                  {texts.intro}
                </Text>

                <Box sx={styles.actions}>
                  <Button as={Link} to='/read/' sx={styles.primaryButton}>
                    {texts.ctaPrimary}
                  </Button>
                  <Button as={Link} to='/contact/' sx={styles.secondaryButton}>
                    {texts.ctaSecondary}
                  </Button>
                </Box>
              </Flex>

              <Box sx={styles.imageWrap}>
                <img src='https://i.imgur.com/7hDFuhb.png' alt={texts.imageAlt} />
              </Box>
            </Grid>
          </Box>

          <Box sx={styles.cards}>
            <Box sx={styles.infoCard}>
              <Heading as='h2' sx={{ fontSize: 3, mb: 2 }}>
                {texts.cardOneTitle}
              </Heading>
              <Text sx={{ color: 'omegaDark', lineHeight: 1.8 }}>{texts.cardOneBody}</Text>
            </Box>

            <Box sx={styles.infoCard}>
              <Heading as='h2' sx={{ fontSize: 3, mb: 2 }}>
                {texts.cardTwoTitle}
              </Heading>
              <Text sx={{ color: 'omegaDark', lineHeight: 1.8 }}>{texts.cardTwoBody}</Text>
            </Box>

            <Box sx={styles.infoCard}>
              <Heading as='h2' sx={{ fontSize: 3, mb: 2 }}>
                {texts.cardThreeTitle}
              </Heading>
              <Text sx={{ color: 'omegaDark', lineHeight: 1.8 }}>{texts.cardThreeBody}</Text>
            </Box>
          </Box>
        </Main>
      </Stack>
    </Layout>
  )
}

export default AboutPage
