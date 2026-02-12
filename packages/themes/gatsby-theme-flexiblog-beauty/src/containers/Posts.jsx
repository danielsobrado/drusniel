import React from 'react';
import { Box, Container } from 'theme-ui';
import { Layout, Stack, Main, Sidebar, Hero } from '@layout';
import CardList from '@components/CardList';
import Divider from '@components/Divider';
import MemphisPattern from '@components/MemphisPattern';
import Seo from '@widgets/Seo';
import NewsletterExpanded from '@widgets/NewsletterExpanded';
import Sponsor from '@widgets/Sponsor';
import Categories from '@widgets/Categories';
import { useBlogCategories } from '@helpers-blog';
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const styles = {
  heroThumbsContainer: {
    left: `50%`,
    top: `50%`,
    position: `absolute`,
    transform: `translate(-50%, -50%)`,
    display: [`none`, null, null, `block`],
  },
  heroThumbsInner: {
    width: `1/3`,
    ml: `auto`,
  },
};

const Posts = ({ data, ...props }) => {
  const { language } = useContext(LanguageContext);

  const featuredPosts1 = language === 'en' ? data.featuredPostsEN : data.featuredPostsES;
  const recentPosts1 = language === 'en' ? data.recentPostsEN : data.recentPostsES;

  const texts = {
    en: {
      titleLanguage: 'News from Astarion',
      OurLatestAdventures: 'Our latest adventures',
      TrendingNow: 'Trending Now',
    },
    es: {
      titleLanguage: 'Noticias desde Astarion',
      OurLatestAdventures: 'Últimas aventuras',
      TrendingNow: 'Tendencias',
    },
  };

  const { titleLanguage, OurLatestAdventures, TrendingNow } = texts[language];

  const { pageContext: { services = {} } = {} } = props;
  const categories = useBlogCategories();
  const sliderRef = React.useRef();

  // Start-here slugs for both languages (reading entry points)
  const startHereSlugs = [
    'the-call-to-zuraldi',
    'la-llamada-a-zuraldi',
    'the-sacred-chamber',
    'la-camara-sagrada',
  ];
  const isStartHere = (post) =>
    startHereSlugs.some((s) => post.slug && post.slug.includes(s));

  // Filter featured posts by language (date order from query)
  const filteredFeaturedPostsNodes = featuredPosts1.nodes.filter(
    (post) => post.language === language
  );

  // For "Últimas aventuras" sections: start-here posts first, then the rest
  const heroSkip = 3;
  const afterHero = filteredFeaturedPostsNodes.slice(heroSkip);
  const startHereNodes = afterHero
    .filter(isStartHere)
    .map((p) => ({ ...p, startHere: true }));
  const otherNodes = afterHero.filter((p) => !isStartHere(p));
  const aventurasNodes = [...startHereNodes, ...otherNodes];

  // Filter recent posts by language
  const filteredRecentPostsNodes = recentPosts1.nodes.filter(
    (post) => post.language === language
  );

  // Filter posts.group by language and sort by custom order
  const categoryOrder = [
    "Umbra'kor",
    'Stonehold',
    'Lumeshire',
    'Grukmar',
    'Wyrmreach',
  ];

  const filteredPostsGroup = data.posts.group
    .map((group) => ({
      ...group,
      nodes: group.nodes.filter((post) => post.language === language),
    }))
    .filter((group) => group.nodes.length > 0)
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.categoryName);
      const indexB = categoryOrder.indexOf(b.categoryName);
      // Categories not in the list go to the end, preserving their relative order
      const orderA = indexA === -1 ? categoryOrder.length : indexA;
      const orderB = indexB === -1 ? categoryOrder.length : indexB;
      return orderA - orderB;
    });

  return (
    <Layout {...props}>
      <Seo title={language === 'en' ? 'Home' : 'Inicio'} />
      <Hero full sx={{ position: `relative` }}>
        <CardList
          nodes={filteredFeaturedPostsNodes}
          limit={3}
          variant="horizontal-cover-hero"
          omitFooter
          slider
          autoPlay
          fade
          dots={false}
          arrows={false}
          ref={sliderRef}
          loading="eager"
        />
        <Container sx={styles.heroThumbsContainer}>
          <Box sx={styles.heroThumbsInner}>
            <CardList
              nodes={filteredFeaturedPostsNodes}
              limit={3}
              variant="horizontal-aside"
              imageVariant="hero"
              asNavFor={sliderRef}
              loading="eager"
            />
          </Box>
        </Container>
      </Hero>
      <Divider />
      <Stack>
        <Main>
          <CardList
            nodes={aventurasNodes}
            limit={4}
            columns={[1, 2, 1, 2]}
            variant={['horizontal-md', 'vertical']}
            omitMedia
            title={titleLanguage}
          />
        </Main>
        <Sidebar pl={4}>
          <Categories categories={categories} />
          <Divider />
          {/* <Sponsor /> */}
        </Sidebar>
      </Stack>
      <Divider />
      <Hero wide sx={{ bg: `contentBg`, pb: [3, 5], pt: [4, 5] }}>
        <Box sx={{ position: `relative`, zIndex: 2 }}>
          <CardList
            key={language}
            nodes={aventurasNodes}
            limit={4}
            columns={[1, 2, 2, 4]}
            variant={['vertical-cover']}
            title={OurLatestAdventures}
            aside
          />
        </Box>
        <MemphisPattern />
      </Hero>
      <Divider />
      {filteredPostsGroup.length &&
        filteredPostsGroup.map((group, index) => (
          <React.Fragment key={`${group.categoryName}.list`}>
            {index % 2 === 0 ? (
              <Stack
                title={group.categoryName}
                titleLink={`/${language}${group.nodes[0].category.slug}`}
              >
                <Main>
                  <CardList
                    nodes={group.nodes}
                    limit={6}
                    columns={[1, 1, 2]}
                    variant={['horizontal-md', 'horizontal']}
                    omitCategory
                    omitExcerpt
                  />
                </Main>
              </Stack>
            ) : (
              <Stack
                title={group.categoryName}
                titleLink={`/${language}${group.nodes[0].category.slug}`}
              >
                <Main>
                  <CardList
                    nodes={group.nodes}
                    limit={3}
                    columns={[1, 1, 2, 3]}
                    variant={[
                      'horizontal-md',
                      'horizontal',
                      'horizontal',
                      'vertical',
                    ]}
                    omitCategory
                    omitExcerpt
                  />
                  <Divider space={2} />
                  <CardList
                    nodes={group.nodes}
                    limit={3}
                    skip={3}
                    columns={[1, 2, 3]}
                    variant={['horizontal-md', 'horizontal-aside']}
                    omitCategory
                    omitExcerpt
                  />
                  <Divider space={2} />
                  <CardList
                    nodes={group.nodes}
                    limit={3}
                    skip={6}
                    columns={[1, 1, 2, 3]}
                    variant={[
                      'horizontal-md',
                      'horizontal',
                      'horizontal',
                      'vertical',
                    ]}
                    omitCategory
                    omitExcerpt
                  />
                </Main>
              </Stack>
            )}
            {index === 1 && (
              <>
                <Divider />
                <Hero wide sx={{ pb: [3, 5], pt: [4, 5] }}>
                  <Box sx={{ position: `relative`, zIndex: 2 }}>
                    <CardList
                      nodes={aventurasNodes}
                      limit={2}
                      skip={4}
                      columns={[1, 1, 1, 2]}
                      variant={[
                        'horizontal-md',
                        'horizontal',
                        'horizontal',
                        'horizontal-lg',
                      ]}
                      title={TrendingNow}
                      aside
                    />
                  </Box>
                  <MemphisPattern />
                </Hero>
              </>
            )}
            {index !== filteredPostsGroup.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      <Stack>
        <Main>
          {services.mailchimp && (
            <>
              <Divider />
              <NewsletterExpanded simple />
            </>
          )}
        </Main>
      </Stack>
    </Layout>
  );
};

export default Posts;