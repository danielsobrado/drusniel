import React from 'react'
import { Link } from 'gatsby'
import { Card, Badge, Box } from 'theme-ui'
import Section from '@components/Section'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const Tags = ({ tags, ...props }) => {
  const { language } = useContext(LanguageContext);
  
  return (
  <Section aside title='Tags' {...props}>
    <Card variant='paper'>
      <Box variant='lists.badges'>
        {tags &&
          tags.map(({ id, name, slug }) => (
            <Badge variant='tag' key={id} as={Link} to={`/${language}${slug}`}>
              {name}
            </Badge>
          ))}
      </Box>
    </Card>
  </Section>
)
          }

export default Tags
