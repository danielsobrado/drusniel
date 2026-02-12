import React from 'react'
import { Card, Text } from 'theme-ui'
import Section from '@components/Section'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

// translate title and text
const Commitment = props => {
  const { language } = useContext(LanguageContext);
  let title = "Say Hi!";
  if (language === "es") {
    title = "¡Escríbeme!";
  }
  let text = "Hello there! We're thrilled to be connected with you and help bring your ideas to life using A.I.";
  if (language === "es") {
    text = "¡Hola! Estaré encantado de estar en contacto contigo y ayudarte a dar vida a tus ideas usando I.A.";
  }
  return (
    <Section aside title={title} {...props}>
      <Card variant='paper'>
        <Text variant='p'>
          {text}
        </Text>
      </Card>
    </Section>
  )
}

export default Commitment
