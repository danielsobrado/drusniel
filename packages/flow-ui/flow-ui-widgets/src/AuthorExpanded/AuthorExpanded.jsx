import React, { useContext } from 'react';
import { Link as GLink } from 'gatsby';
import { Flex, Box, Text, Heading, Card, Badge, Link } from 'theme-ui';
import MemphisPattern from '@components/MemphisPattern';
import Avatar from '@components/Avatar';
import Navigation from '@components/Navigation';
import attachSocialIcons from '@helpers/attachSocialIcons';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  card: {
    position: `relative`
  },
  wrapper: {
    flexDirection: [`column`, `row`],
    position: `relative`,
    zIndex: 3
  },
  avatarColumn: {
    flexBasis: `1/3`
  },
  infoColumn: {
    flexBasis: `2/3`
  },
  innerBox: {
    flexBasis: `1/7`,
    flexGrow: 1,
    px: [0, 3],
    mt: [3, 0]
  },
  subheader: {
    color: `omegaDark`
  },
  name: {
    textAlign: [`center`, `left`],
    mt: [3, 0],
    px: 3
  },
  bio: {
    textAlign: [`center`, `left`]
  },
  socialList: {
    a: {
      m: 0
    }
  },
  link: {
    position: `absolute`,
    top: 10,
    right: 10,
    zIndex: 3
  },
  pattern: {
    borderRadius: `lg`
  },
  gradient: {
    size: `full`,
    borderRadius: `lg`,
    position: `absolute`,
    left: 0,
    top: 0,
    zIndex: 2,
    background: [
      t =>
        `linear-gradient(0deg, ${t.colors.contentBg} 20%, rgba(255, 255, 255, 0) 80%)`,
      t =>
        `linear-gradient(270deg, ${t.colors.contentBg} 20%, rgba(255, 255, 255, 0) 100%)`
    ]
  }
}

const Subheader = ({ children }) => (
  <Heading variant='h4' sx={styles.subheader}>
    {children}
  </Heading>
);

const AuthorAvatar = ({ name, thumbnail, slug }) => {
  const { language } = useContext(LanguageContext);

  // Check if the slug already includes the language prefix
  const slugWithLanguage = slug.startsWith(`/${language}/`) ? slug : `/${language}${slug}`;

  return thumbnail ? (
    <Box>
      <Link as={GLink} to={slugWithLanguage} aria-label={name}>
        <Avatar avatar={thumbnail} alt={name} />
      </Link>
    </Box>
  ) : null;
};

  const AuthorName = ({ name, slug }) => {
    const { language } = useContext(LanguageContext);
  
    // Check if the slug already includes the language prefix
    const slugWithLanguage = slug.startsWith(`/${language}/`) ? slug : `/${language}${slug}`;
  
    return (
      <Box sx={styles.name}>
        <Heading variant='h3'>
          <Link as={GLink} to={slugWithLanguage}>
            {name}
          </Link>
        </Heading>
      </Box>
    );
  };

const AuthorBio = ({ title, description, titlees, descriptiones }) => {
  const { language } = useContext(LanguageContext);
  const currentTitle = language === 'en' ? title : titlees;
  const currentDescription = language === 'en' ? description : descriptiones;

  console.log("descriptiones: " + currentDescription);

  return (
    <Box sx={styles.bio}>
      <Subheader>{currentTitle}</Subheader>
      <Text>{currentDescription}</Text>
    </Box>
  );
};

const AuthorSkills = ({ skills, skillses }) => {
  const { language } = useContext(LanguageContext);
  const currentSkills = language === 'en' ? skills : skillses;

  const translations = {
    en: {
      expertise: 'Expertise',
    },
    es: {
      expertise: 'Experiencia',
    },
  };

  return currentSkills ? (
    <Box sx={styles.innerBox}>
      <Subheader>{translations[language].expertise}</Subheader>
      {currentSkills.map((skill) => (
        <Text key={`skill-${skill}`}>{skill}</Text>
      ))}
    </Box>
  ) : null;
};

const AuthorSocialMedia = ({ social }) => {
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      socialMedia: 'Social Media',
    },
    es: {
      socialMedia: 'Redes Sociales',
    },
  };

  return social ? (
    <Box sx={styles.innerBox}>
      <Subheader>{translations[language].socialMedia}</Subheader>
      <Navigation
        variant='vertical'
        items={attachSocialIcons(social)}
        wrapperStyle={styles.socialList}
      />
    </Box>
  ) : null;
};

const AuthorExpanded = ({ author, withLink }) => {
  if (!author) return null;
  const { social, title, description, titlees, descriptiones, skills, skillses } = author;

  return (
    <Card variant='paper' sx={styles.card}>
      <Flex sx={styles.wrapper}>
        <Box sx={styles.avatarColumn}>
          <AuthorAvatar {...author} />
        </Box>
        <Box sx={styles.infoColumn}>
          <AuthorName {...author} />
          <Flex sx={styles.wrapper}>
            <Box sx={styles.innerBox}>
              <AuthorBio title={title} description={description} titlees={titlees} descriptiones={descriptiones} />
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Box sx={styles.gradient} />
      <MemphisPattern sx={styles.pattern} />
    </Card>
  );
};

export default AuthorExpanded;