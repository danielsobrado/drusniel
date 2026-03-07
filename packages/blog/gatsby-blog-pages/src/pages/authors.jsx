import React from 'react'
import { Layout, Stack, Main } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import AuthorExpanded from '@widgets/AuthorExpanded'
import { Box, Button, Flex } from 'theme-ui'
import { useContext } from 'react';
import { useBlogAuthors } from '@helpers-blog'
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const PageAuthors = props => {
  const mainCharacters = useBlogAuthors('notGods')
  const secondaryCharacters = useBlogAuthors('secondary')
  const gods = useBlogAuthors('gods')
  const objects = useBlogAuthors('objects')
  const { language } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = React.useState('characters');

  // Page header
  let pageHeader = 'Characters';
  let pageSubheader = 'Step into the murky world of Astalor, where characters navigate the gray edges of morality, their destinies intertwined in a grim dance of power, betrayal, and survival.';

  // Tab/section headers
  let mainHeader = 'Main Characters';
  let secondaryHeader = 'Secondary Characters';
  let godsHeader = 'Gods';
  let objectsHeader = 'Objects';

  let tabCharacters = 'Characters';
  let tabSecondary = 'Secondary';
  let tabGods = 'Gods';
  let tabObjects = 'Objects';

  if (language === "es") {
    pageHeader = 'Personajes';
    pageSubheader = 'Entra al mundo oscuro de Astalor, donde los personajes exploran los límites oscuros de la ética, y sus vidas se entrelazan en un oscuro juego de poder, traición y supervivencia.';
    mainHeader = 'Personajes Principales';
    secondaryHeader = 'Personajes Secundarios';
    godsHeader = 'Dioses';
    objectsHeader = 'Objetos';
    tabCharacters = 'Personajes';
    tabSecondary = 'Secundarios';
    tabGods = 'Dioses';
    tabObjects = 'Objetos';
  }

  const tabs = [
    { id: 'characters', label: tabCharacters, header: mainHeader, authors: mainCharacters },
    { id: 'secondary', label: tabSecondary, header: secondaryHeader, authors: secondaryCharacters },
    { id: 'gods', label: tabGods, header: godsHeader, authors: gods },
    { id: 'objects', label: tabObjects, header: objectsHeader, authors: objects },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const styles = {
    tabBar: {
      flexWrap: 'wrap',
      gap: 2,
      mb: 3,
    },
    tabButton: {
      bg: 'omegaLight',
      color: 'omegaDark',
      px: 3,
      py: 2,
      borderRadius: 'md',
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.9,
      },
    },
    activeTabButton: {
      bg: 'alpha',
      color: 'white',
    },
  };

  return (
    <Layout {...props}>
      <Seo title='Characters' />
      <Divider />
      <Stack effectProps={{ effect: 'fadeInDown' }}>
        <PageTitle
          header={pageHeader}
          subheader={pageSubheader}
        />
      </Stack>

      <Stack>
        <Main>
          <Flex sx={styles.tabBar}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.activeTabButton : {}),
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Flex>
        </Main>
      </Stack>

      <Stack>
        <Main>
          <PageTitle
            header={currentTab.header}
            subheader=""
          />
          {currentTab.authors.map((author, i) => (
            <React.Fragment key={`${currentTab.id}-${i}`}>
              <Divider />
              <AuthorExpanded author={author} withLink />
            </React.Fragment>
          ))}
          {!currentTab.authors.length && (
            <Box>
              <Divider />
            </Box>
          )}
        </Main>
      </Stack>
    </Layout>
  )
}

export default PageAuthors
