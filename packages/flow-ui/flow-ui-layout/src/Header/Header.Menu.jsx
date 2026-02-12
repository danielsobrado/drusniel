import { Box } from 'theme-ui'
import Navigation from '@components/Navigation'
import Drawer from '@components/Drawer'
import useSiteMetadata from '@helpers-blog/useSiteMetadata'
import React, { useContext } from 'react'
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  desktopMenu: { display: [`none`, null, `block`] },
  mobileMenu: { display: [`block`, null, `none`] },
  desktopMenuWrapper: { justifyContent: 'flex-end' }
}

export const HeaderMenu = ({ mobileMenu = {} }) => {
  const { headerMenu } = useSiteMetadata()
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      home: 'Home',
      characters: 'Characters',
      gods: 'Gods',
      contact: 'Contact',
      mainMenu: 'Main Menu',
      regions: 'Regions',
      read: 'Read This',
    },
    es: {
      home: 'Inicio',
      characters: 'Personajes',
      gods: 'Dioses',
      contact: 'Contacto',
      mainMenu: 'Menú Principal',
      read: 'Empezemos',
    },
  };

  const menuItemsWithLanguageToggle = headerMenu.map((item) => ({
    ...item,
    name: translations[language][item.name.toLowerCase()],
    slug: item.slug,
  }));

  const desktopMenuNav = (
    <Navigation
      variant='horizontal'
      items={menuItemsWithLanguageToggle}
      wrapperStyle={styles.desktopMenuWrapper}
    >
    </Navigation>
  );

  console.log("header menu: " + menuItemsWithLanguageToggle);

  const mobileMenuItems = [
    {
      title: translations[language].mainMenu,
      items: headerMenu.map((item) => ({
        ...item,
        name: translations[language][item.name.toLowerCase()],
        slug: item.slug,
      })),
    },
    ...(mobileMenu.items ? [
      {
        title: translations[language].regions,
        items: mobileMenu.items.map((item) => ({
          ...item,
          slug: `/${language}${item.slug}`,
        })),
      },
    ] : []),
  ];

  const mobileMenuNav = (
    <Drawer>
      <Navigation
        variant='vertical'
        headingProps={{ variant: 'h3' }}
        items={mobileMenuItems}
      ></Navigation>
    </Drawer>
  );

  return (
    <>
      <Box sx={styles.desktopMenu}>{desktopMenuNav}</Box>
      <Box sx={styles.mobileMenu}>{mobileMenuNav}</Box>
    </>
  );
};