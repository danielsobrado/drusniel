import React from 'react';
import { Link as GLink } from 'gatsby';
import { Box, Heading, Card, Link } from 'theme-ui';
import Navigation from '@components/Navigation';
import Section from '@components/Section';
import Avatar from '@components/Avatar';
import attachSocialIcons from '@helpers/attachSocialIcons';
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  wrapper: {
    textAlign: `center`,
  },
  avatarWrapper: {
    mb: 4,
  },
  title: {
    color: `omegaDark`,
  },
};

const AuthorCompact = ({ author, omitSocial, ...props }) => {
  if (!author) return '';

  const { language } = useContext(LanguageContext);
  const { name, slug, thumbnail, title, titlees, social } = author;

  const currentTitle = language === 'en' ? title : titlees;

  return (
    <Section aside title='The Author' {...props}>
      <Card variant='paper'>
        <Box sx={styles.wrapper}>
          {thumbnail && (
            <Box sx={styles.avatarWrapper}>
              <Link as={GLink} to={`/${language}${slug}`} aria-label={name}>
                <Avatar avatar={thumbnail} alt={name} withPattern />
              </Link>
            </Box>
          )}
          <Link as={GLink} to={`/${language}${slug}`}>
            <Heading variant='h3'>{name}</Heading>
          </Link>
          <Heading variant='h4' sx={styles.title}>
            {currentTitle}
          </Heading>
          {!omitSocial && social && (
            <Navigation
              variant='horizontal'
              items={attachSocialIcons(social)}
              iconOnly
            />
          )}
        </Box>
      </Card>
    </Section>
  );
};

export default AuthorCompact;