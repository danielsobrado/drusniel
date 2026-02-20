import React from 'react'
import { Link as GLink } from 'gatsby'
import { Text, Link } from 'theme-ui'
import rv from '@components/utils/buildResponsiveVariant'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  author: {
    pr: 2
  }
}

const CardFooterAuthorName = ({ variant, omitAuthor, author }) => {
  const { language } = useContext(LanguageContext);

  return !omitAuthor && author && author.slug ? (
    <Text sx={{ ...styles.author, variant: rv(variant, 'author') }}>
      <Link variant='mute' as={GLink} to={`/${language}${author.slug}`}>
        <strong>{author.name}</strong>
      </Link>
    </Text>
  ) : null;
}

export default CardFooterAuthorName