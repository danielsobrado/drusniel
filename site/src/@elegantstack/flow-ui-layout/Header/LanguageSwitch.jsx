import React, { useContext } from 'react';
import { Box, IconButton, css } from 'theme-ui';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import { FaGlobe, FaLanguage } from 'react-icons/fa';
import { LanguageContext } from '@helpers-blog/useLanguageContext';
import pageContextProvider from '@helpers/pageContextProvider'
import { navigate } from 'gatsby'

const styles = {
    switch: {
        display: [`none`, null, `block`],
        // Switch Body
        '&.rc-switch': {
            background: `linear-gradient(45deg, #FF7D6B, #FFD64C)`,
            border: 0,
            width: 50,
            height: 24,
            '&:focus': {
                boxShadow: `none`,
            },
        },
        '&.rc-switch-checked': {
            background: `linear-gradient(45deg, #3366FF, #AC15B8)`,
            border: 0,
        },
        // Switch Handle
        '&.rc-switch:after': {
            size: `21px`,
        },
        '&.rc-switch-checked:after': {
            left: `auto`,
            right: `2px`,
        },
        // Switch Icons
        '.rc-switch-inner': {
            fontSize: `unset`,
            top: `1px`,
            left: `26px`,
        },
        '&.rc-switch-checked .rc-switch-inner': {
            left: `7px`,
        },
    },
    icon: {
        verticalAlign: `middle`,
    },
    //Mobile
    mobileTrigger: {
        display: [`block`, null, `none`],
    },
};

export const LanguageSwitch = () => {
    const { language, setLanguage } = useContext(LanguageContext);
    const context = useContext(pageContextProvider) || {};
    const { pageContext, location } = context;

    const isEnglish = language === 'en';

    const handleChange = () => {
        const targetLang = language === 'en' ? 'es' : 'en';

        // Check if counterpart path exists in pageContext
        // We injected it in the Post container shadowing
        if (pageContext?.counterpartPath) {
            setLanguage(targetLang); // Update state
            navigate(pageContext.counterpartPath);
            return;
        }

        // Default behavior for other pages (like home, archive)
        // Assuming simple path replacement or just state verification
        // Original logic was just setLanguage, but usually that doesn't navigate.
        // If we are on /en/foo and switch to es, we probably want /es/foo if possible, 
        // or just the home page /es/ if no direct mapping is known.
        // Since we don't have a universal mapping for non-posts here, let's try a simple URL replacement mechanism
        // if the URL structure is consistent.

        const currentPath = location?.pathname || '';
        let newPath = '';

        if (currentPath.startsWith('/en/')) {
            newPath = currentPath.replace('/en/', '/es/');
        } else if (currentPath.startsWith('/es/')) {
            newPath = currentPath.replace('/es/', '/en/');
        } else {
            // Fallback or Home
            newPath = targetLang === 'en' ? '/en/' : '/es/';
        }

        setLanguage(targetLang);
        navigate(newPath);
    };

    const label = `Toggle language`;

    return (
        <Box>
            <IconButton
                aria-label={label}
                onClick={handleChange}
                sx={styles.mobileTrigger}
            >
                {isEnglish ? <FaGlobe /> : <FaLanguage />}
            </IconButton>
            <Switch
                aria-label={label}
                onChange={handleChange}
                onClick={handleChange}
                checked={isEnglish}
                checkedChildren={<span>EN</span>}
                unCheckedChildren={<span>ES</span>}
                css={css(styles.switch)}
            />
        </Box>
    );
};
