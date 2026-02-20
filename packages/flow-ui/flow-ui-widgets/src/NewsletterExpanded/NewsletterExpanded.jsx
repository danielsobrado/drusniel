import React, { useContext } from 'react';
import { css } from 'theme-ui';
import { Card, Text, Heading, Box } from 'theme-ui';
import NewsletterForm from '@components/NewsletterForm';
import useMailChimp from '@helpers/useMailChimp';
import { FaRegPaperPlane, FaWind } from 'react-icons/fa';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  card: {
    position: `relative`
  },
  wrapper: {
    maxWidth: 500,
    textAlign: `center`,
    mx: `auto`,
    py: 3
  },
  icons: {
    display: [`none`, null, `block`],
    position: `absolute`,
    top: `-3rem`,
    left: `5rem`,
    svg: {
      display: `block`
    }
  },
  plane: {
    fontSize: `9rem`,
    color: `beta`
  },
  wind: {
    fontSize: `7rem`,
    color: `omegaLight`,
    transform: `rotate(120deg)`,
    mt: `0.5rem`,
    ml: `-3rem`
  },
  form: {
    maxWidth: 300,
    mx: `auto`,
    mt: 4
  }
}

const NewsletterExpanded = ({ simple }) => {
  const { language } = useContext(LanguageContext);
  const { handleSubmit, canSubmit, submitting, message, success } = useMailChimp();

  const texts = {
    en: {
      title: 'Subscribe to receive new adventures!',
      description: "I'll send you just adventures, no spam. I promise.",
    },
    es: {
      title: '¡Suscríbete para recibir nuevas aventuras!',
      description: 'Te enviaré sólo aventuras, nada de spam. Te lo prometo.',
    },
  };

  const { title, description } = texts[language];

  return (
    <Card variant="paper" sx={styles.card}>
      <Box sx={styles.wrapper}>
        {!simple && (
          <Box sx={styles.icons}>
            <FaRegPaperPlane css={css(styles.plane)} />
            <FaWind css={css(styles.wind)} />
          </Box>
        )}
        <Heading variant="h2">{title}</Heading>
        <Text variant="p">{description}</Text>
        <Box sx={styles.form}>
          <NewsletterForm {...{ handleSubmit, canSubmit, submitting, message, success }} />
        </Box>
      </Box>
    </Card>
  );
};

NewsletterExpanded.defaultProps = {
  simple: false,
};

export default NewsletterExpanded;