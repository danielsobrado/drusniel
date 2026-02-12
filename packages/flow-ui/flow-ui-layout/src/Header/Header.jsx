import React, { useContext } from 'react';
import { Container, Box, Flex } from 'theme-ui';
import pageContextProvider from '@helpers/pageContextProvider';
import Search from '@widgets/Search';
import { HeaderLogo } from './Header.Logo';
import { HeaderMenu } from './Header.Menu';
import { HeaderColorMode } from './Header.ColorMode';
import { LanguageSwitch } from './LanguageSwitch';

const styles = {
  wrapper: {
    position: `relative`,
    bg: `headerBg`,
  },
  container: {
    position: `relative`,
    zIndex: 10,
  },
  logoContainer: {
    flexBasis: [`full`, null, `1/4`],
  },
  searchContainer: {
    flexBasis: [`auto`, null, `1/4`],
    minWidth: `auto`,
    order: [3, null, `unset`],
    mx: 3,
  },
  menuContainer: {
    flexBasis: [`auto`, null, `2/4`],
    minWidth: `auto`,
    order: [4, null, `unset`],
  },
  switchContainer: {
    minWidth: `auto`,
    order: [2, null, `unset`],
    display: `flex`,
    alignItems: `center`,
  },
};

export const Header = ({ children }) => {
  const context = useContext(pageContextProvider);
  const { services, mobileMenu, darkMode } = context.pageContext;
  const algolia = services && services.algolia;

  return (
    <Box sx={styles.wrapper}>
      <Container variant="compact" sx={styles.container}>
        <Flex variant="layout.header">
          <Box sx={styles.logoContainer}>
            <HeaderLogo />
          </Box>
          <Box sx={styles.searchContainer}>{algolia && <Search />}</Box>
          <Box sx={styles.menuContainer}>
            <HeaderMenu mobileMenu={mobileMenu} isPostPage={true} />
          </Box>
          <Box sx={styles.switchContainer}>
            {darkMode && <HeaderColorMode />}
            <LanguageSwitch />
          </Box>
        </Flex>
      </Container>
      {children}
    </Box>
  );
};