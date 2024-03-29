import React from 'react'
import { Link as GLink } from 'gatsby'
import { Heading } from 'theme-ui'
import rv from '@components/utils/buildResponsiveVariant'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const CardBodyTitle = ({ variant, title, slug, link }) => {
  const { language } = useContext(LanguageContext);

  const linkProps = link
    ? {
        as: 'a',
        href: link,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    : {
        as: GLink,
        to: slug
      }
  return (
    <Heading {...linkProps} sx={{ variant: rv(variant, 'title') }}>
      {title}
    </Heading>
  )
}

export default CardBodyTitle