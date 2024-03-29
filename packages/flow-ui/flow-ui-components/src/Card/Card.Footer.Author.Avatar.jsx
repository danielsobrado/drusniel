import React from 'react'
import { Link as GLink } from 'gatsby'
import { Link, useThemeUI, get } from 'theme-ui'
import AvatarSimple from '@components/AvatarSimple'
import rv from '@components/utils/buildResponsiveVariant'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const CardFooterAuthorAvatar = ({ variant, omitAuthor, author }) => {
  const context = useThemeUI()
  const { language } = useContext(LanguageContext);

  if (omitAuthor) return null

  const responsiveVariant = rv(variant, 'authorPhoto')

  const visibility = responsiveVariant.reduce(
    (mobileVisibility, variant) =>
      mobileVisibility === false &&
      get(context.theme, variant, {}).display === 'none'
        ? false
        : true,
    false
  )

  return visibility ? (
    author && author.thumbnail ? (
      <Link
        as={GLink}
        to={`/${language}${author.slug}`}
        aria-label={author.name}
        sx={{ variant: responsiveVariant }}
      >
        <AvatarSimple
          avatar={author.thumbnail}
          alt={author.name}
          size='small'
        />
      </Link>
    ) : null
  ) : null
}
export default CardFooterAuthorAvatar