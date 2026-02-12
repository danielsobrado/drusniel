import React from 'react';
import { Link as GLink } from 'gatsby';
import { Flex, Card, Grid, Link, Heading } from 'theme-ui';
import Section from '@components/Section';
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  number: {
    color: `omega`,
    width: `2rem`,
    mr: 3,
    mb: 0
  },
  text: {
    flex: `1`,
    ':hover': { color: 'alphaDark' },
    mb: 0
  }
};

const TableOfContentsExpanded = ({ tableOfContents: { items = [] }, columns }) => {
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
    <Section title={title}>
      <Card variant='paper'>
        <Grid
          sx={{
            gridRowGap: 1,
            gridAutoFlow: [`row`, null, `column`],
            gridTemplateRows: [
              `auto`,
              null,
              `repeat(${Math.ceil(items.length / columns)}, 1fr)`
            ]
          }}
        >
          {items.map((item, index) => (
            <Link key={`item-${index}`} as={GLink} to={item.url} variant='vertical'>
              <Flex sx={{ alignItems: `center` }}>
                <Heading variant='h3' as='div' sx={styles.number}>
                  {(index + 1).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                  })}
                </Heading>
                <Heading variant='h4' as='div' sx={styles.text}>
                  {item.title}
                </Heading>
              </Flex>
            </Link>
          ))}
        </Grid>
      </Card>
    </Section>
  ) : null;
};

TableOfContentsExpanded.defaultProps = {
  columns: 2
};

export default TableOfContentsExpanded;