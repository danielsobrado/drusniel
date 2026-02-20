import React from 'react';
import { Link as GLink } from 'gatsby';
import { Flex, Card, Link, Text, Heading } from 'theme-ui';
import Section from '@components/Section';
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  item: {
    display: `block`,
    '& + &': { mt: 3 }
  },
  number: {
    color: 'alpha',
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
    bg: `omegaLighter`,
    borderRadius: `full`,
    size: 25,
    mr: 2,
    mb: 0
  },
  text: {
    flex: `1`,
    lineHeight: `heading`,
    mb: 0
  }
};

const TableOfContentsCompact = ({ tableOfContents: { items = [] } }) => {
  const { language } = useContext(LanguageContext);

  const texts = {
    en: {
      title: 'Table Of Contents'
    },
    es: {
      title: 'Tabla de Contenidos'
    }
  };

  const { title } = texts[language];

  return items.length > 1 ? (
    <Section aside title={title}>
      <Card variant='paper'>
        {items.map((item, index) => (
          <Link
            key={`item-${index}`}
            as={GLink}
            to={item.url}
            variant='vertical'
            sx={styles.item}
          >
            <Flex sx={{ alignItems: `baseline` }}>
              <Heading variant='h5' as='div' sx={styles.number}>
                {index + 1}
              </Heading>
              <Text sx={styles.text}>{item.title}</Text>
            </Flex>
          </Link>
        ))}
      </Card>
    </Section>
  ) : null;
};

export default TableOfContentsCompact;