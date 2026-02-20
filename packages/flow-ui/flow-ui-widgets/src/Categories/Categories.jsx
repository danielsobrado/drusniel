import React from 'react'
import { Box } from 'theme-ui'
import { FaArchive } from 'react-icons/fa'
import IconButton from '@components/IconButton'
import Section from '@components/Section'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  horizontal: {
    display: `flex`,
    flexWrap: `nowrap`,
    overflowX: `auto`,
    width: `auto`,
    scrollBehavior: `smooth`,
    m: -2,
    a: {
      flex: 1,
      minWidth: [`1/3`, `auto`],
      m: 2
    }
  }
}

const Categories = ({ variant, categories, ...props }) => {
  const { language } = useContext(LanguageContext);

  const texts = {
    en: {
      title: 'Regions',
    },
    es: {
      title: 'Regiones',
    },
  };

  const { title } = texts[language];

  return (
    <Section aside={variant === 'vertical'} title={title} {...props}>
      <Box sx={styles[variant]}>
        {categories && categories.map(({ id, name, slug, totalCount, icon }) => {
          const buttonProps = {
            key: id,
            name,
            number: totalCount,
            to: slug,
            iconPath: icon,
            Icon: !icon && FaArchive,
            variant,
          };
          return totalCount !== 0 && <IconButton {...buttonProps} />;
        })}
      </Box>
    </Section>
  );
};

export default Categories

Categories.defaultProps = {
  variant: 'vertical'
}