import React, { useContext } from 'react';
import { Container, Box, Flex } from 'theme-ui';
import pageContextProvider from '@helpers/pageContextProvider';
import Search from '@widgets/Search';
import { HeaderLogo } from './Header.Logo';
import { HeaderMenu } from './Header.Menu';
import { HeaderColorMode } from './Header.ColorMode';
import { LanguageSwitch } from './LanguageSwitch';
import AuthButton from '@auth/AuthButton';

const styles = {
  wrapper: {
    position: `relative`,
    bg: `headerBg`,
  },
  container: {
    position: `relative`,
    zIndex: 10,
    px: [3, 4, 5],
  },
  logoContainer: {
    flexBasis: [`auto`, null, `auto`],
    flexShrink: 0,
  },
  searchContainer: {
    flexBasis: [`auto`, null, `auto`],
    minWidth: `auto`,
    order: [3, null, `unset`],
    mx: [0, null, 3],
    flexShrink: 0,
  },
  menuContainer: {
    flex: [ `1 0 100%`, null, `1 1 auto` ],
    minWidth: 0,
    order: [4, null, `unset`],
    display: `flex`,
    justifyContent: `center`,
  },
  switchContainer: {
    minWidth: 0,
    order: [2, null, `unset`],
    display: `flex`,
    alignItems: `center`,
    justifyContent: `flex-end`,
    flexShrink: 0,
    maxWidth: [`none`, null, `24rem`],
    ml: [`auto`, null, 0],
  },
};

export const Header = ({ children }) => {
  const context = useContext(pageContextProvider);
  const { services, mobileMenu, darkMode } = context.pageContext;
  const algolia = services && services.algolia;

  return (
    <Box sx={styles.wrapper}>
      <Container variant="wide" sx={styles.container}>
        <Flex variant="layout.header">
          <Box sx={styles.logoContainer}>
            <HeaderLogo />
          </Box>
          {algolia && <Box sx={styles.searchContainer}><Search /></Box>}
          <Box sx={styles.menuContainer}>
            <HeaderMenu mobileMenu={mobileMenu} isPostPage={true} />
          </Box>
          <Box sx={styles.switchContainer}>
            {darkMode && <HeaderColorMode />}
            <LanguageSwitch />
            <AuthButton />
          </Box>
        </Flex>
      </Container>
      {children}
    </Box>
  );
};