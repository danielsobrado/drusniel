import React from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby'
import { Box, Button, Flex, Input, Text } from 'theme-ui'
import { FaBookOpen, FaClock, FaFeatherAlt, FaFilter, FaSearch, FaSortAlphaDown } from 'react-icons/fa'
import { Layout, Stack, Main } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import { LanguageContext } from '@helpers-blog/useLanguageContext'
import getReadableColor from '@components/utils/getReadableColor'

const readIndexQuery = graphql`
  query ReadIndexPageQuery {
    allArticle(
      filter: { private: { ne: true }, draft: { ne: true } }
      sort: [{ order: ASC }, { date: ASC }, { title: ASC }]
      limit: 2000
    ) {
      nodes {
        id
        title
        slug
        link
        language
        order
        date(formatString: "MMM DD, YYYY")
        chapter
        subchapter
        canon_phase
        canon_sequence
        excerpt
        category {
          name
          slug
          color
        }
      }
    }
  }
`

const copy = {
  en: {
    title: 'Reading Index',
    subtitle:
      'A clean guide to every post in reading order. Search by chapter, title, category, or sequence to jump straight to the story you want.',
    introTitle: 'Begin your journey through Astalor here',
    introSubtitle:
      'Start with a curated path into the story, then use the full index below to explore every chapter, prologue, and lore entry at your own pace.',
    searchPlaceholder: 'Search chapters, titles, categories, or sequence…',
    all: 'All',
    main: 'Main',
    prologue: 'Prologue',
    lore: 'Lore',
    results: 'results',
    noResults: 'No posts matched your search.',
    clear: 'Clear',
    searchLabel: 'Quick search',
    indexLabel: 'Story index',
    chapter: 'Chapter',
    part: 'Part',
    book: 'Book 1',
    proseLabel: 'Prologue',
    loreLabel: 'Lore',
    uncategorized: 'General',
    readNow: 'Open post',
    browseHint: 'Use the filters or start typing to narrow the list instantly.',
    sortLabel: 'Sort by',
    readingOrder: 'Reading order',
    alphabetical: 'A-Z',
    newest: 'Newest',
    sortedResults: 'Sorted results',
    startHere: 'Start here',
    continueWith: 'Continue with the full index below',
    aboutLine: 'Want to know who is behind Drusniel?',
    aboutLink: 'Read the about page',
    discordLine: 'Want to join the community?',
    discordLink: 'Join our Discord',
  },
  es: {
    title: 'Índice de lectura',
    subtitle:
      'Una guía con todas las entradas en orden de lectura. Busca por capítulo, título, categoría o secuencia para llegar directo a la historia que quieres.',
    introTitle: 'Inicia tu viaje a través de Astalor aquí',
    introSubtitle:
      'Empieza con una ruta curada hacia la historia y luego usa el índice completo de abajo para explorar cada capítulo, prólogo y entrada de lore a tu ritmo.',
    searchPlaceholder: 'Busca capítulos, títulos, categorías o secuencia…',
    all: 'Todo',
    main: 'Principal',
    prologue: 'Prólogo',
    lore: 'Lore',
    results: 'resultados',
    noResults: 'Ninguna entrada coincide con tu búsqueda.',
    clear: 'Limpiar',
    searchLabel: 'Búsqueda rápida',
    indexLabel: 'Índice de la historia',
    chapter: 'Capítulo',
    part: 'Parte',
    book: 'Libro 1',
    proseLabel: 'Prólogo',
    loreLabel: 'Lore',
    uncategorized: 'General',
    readNow: 'Abrir entrada',
    browseHint: 'Usa los filtros o empieza a escribir para reducir la lista al instante.',
    sortLabel: 'Ordenar por',
    readingOrder: 'Orden de lectura',
    alphabetical: 'A-Z',
    newest: 'Más nuevos',
    sortedResults: 'Resultados ordenados',
    startHere: 'Empieza aquí',
    continueWith: 'Continúa con el índice completo de abajo',
    aboutLine: '¿Quieres saber quién está detrás de Drusniel?',
    aboutLink: 'Lee la página sobre mí',
    discordLine: '¿Quieres unirte a la comunidad?',
    discordLink: 'Únete a nuestro Discord',
  },
}

const phaseLabels = (texts) => ({
  main: texts.main,
  prologue: texts.proseLabel,
  lore: texts.loreLabel,
})

const brandBlue = '#5d7ff2'
const brandBlueSoft = 'rgba(93, 127, 242, 0.10)'
const brandBlueFocus = 'rgba(93, 127, 242, 0.12)'

const styles = {
  topPanel: {
    bg: '#f8f9fc',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '22px',
    p: [3, 4],
    mb: 4,
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)',
  },
  introPanel: {
    bg: '#ffffff',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '22px',
    p: [3, 4],
    mb: 4,
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)',
  },
  introGrid: {
    display: 'grid',
    gridTemplateColumns: ['1fr', null, 'repeat(2, minmax(0, 1fr))'],
    gap: 3,
    mt: 3,
  },
  introCard: {
    bg: '#f8f9fc',
    border: '1px solid rgba(17,17,17,0.06)',
    borderRadius: '18px',
    p: 3,
    minWidth: 0,
  },
  introPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    px: 2,
    py: 1,
    borderRadius: '999px',
    bg: brandBlueSoft,
    color: brandBlue,
    fontSize: 0,
    fontWeight: 700,
    mb: 2,
  },
  introLink: {
    color: 'heading',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 2,
    ':hover': {
      color: brandBlue,
    },
  },
  introFooter: {
    mt: 3,
    pt: 3,
    borderTop: '1px solid rgba(17,17,17,0.06)',
  },
  footerLink: {
    color: brandBlue,
    textDecoration: 'none',
    fontWeight: 700,
    ':hover': {
      textDecoration: 'underline',
    },
  },
  statsRow: {
    gap: 3,
    flexWrap: 'wrap',
    mt: 3,
  },
  statCard: {
    minWidth: '9rem',
    flex: '1 1 10rem',
    bg: '#ffffff',
    borderRadius: '16px',
    border: '1px solid rgba(17,17,17,0.06)',
    px: 3,
    py: 3,
  },
  controls: {
    gap: 3,
    alignItems: ['stretch', null, 'center'],
    flexDirection: ['column', null, 'row'],
    mt: 4,
  },
  searchWrap: {
    flex: '1 1 26rem',
    minWidth: 0,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'omega',
    pointerEvents: 'none',
  },
  input: {
    pl: 5,
    pr: 4,
    height: 52,
    borderRadius: '16px',
    border: '1px solid rgba(17,17,17,0.08)',
    bg: '#ffffff',
    boxShadow: 'none',
    ':focus': {
      borderColor: brandBlue,
      boxShadow: `0 0 0 3px ${brandBlueFocus}`,
      outline: 'none',
    },
  },
  filterWrap: {
    gap: 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  controlsStack: {
    gap: 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterButton: (active) => ({
    px: 3,
    py: 2,
    borderRadius: '999px',
    border: active ? `1px solid ${brandBlue}` : '1px solid rgba(17,17,17,0.08)',
    bg: active ? brandBlueSoft : '#ffffff',
    color: active ? brandBlue : 'text',
    fontWeight: 700,
    cursor: active ? 'default' : 'pointer',
    minHeight: 40,
  }),
  sortButton: (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    px: 3,
    py: 2,
    borderRadius: '999px',
    border: active ? '1px solid #111111' : '1px solid rgba(17,17,17,0.08)',
    bg: active ? '#111111' : '#ffffff',
    color: active ? '#ffffff' : 'text',
    fontWeight: 700,
    cursor: active ? 'default' : 'pointer',
    minHeight: 40,
  }),
  resultsMeta: {
    mt: 3,
    fontSize: 1,
    color: 'omega',
  },
  highlight: {
    bg: 'rgba(255, 214, 76, 0.45)',
    color: 'inherit',
    px: '2px',
    borderRadius: '4px',
    fontWeight: 700,
  },
  sectionCard: {
    bg: '#ffffff',
    borderRadius: '22px',
    border: '1px solid rgba(17,17,17,0.06)',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)',
    overflow: 'hidden',
    mb: 4,
  },
  sectionHeader: {
    px: [3, 4],
    py: 3,
    bg: 'linear-gradient(135deg, rgba(93, 127, 242, 0.10) 0%, rgba(93, 127, 242, 0.03) 100%)',
    borderBottom: '1px solid rgba(17,17,17,0.06)',
  },
  row: {
    px: [3, 4],
    py: 3,
    display: 'grid',
    gridTemplateColumns: ['1fr', null, 'minmax(0, 1.8fr) minmax(0, 1fr) auto'],
    gap: 3,
    alignItems: 'center',
    borderTop: '1px solid rgba(17,17,17,0.06)',
  },
  chapterPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    px: 2,
    py: 1,
    borderRadius: '999px',
    bg: brandBlueSoft,
    color: brandBlue,
    fontSize: 0,
    fontWeight: 700,
    mb: 2,
    width: 'fit-content',
  },
  titleLink: {
    color: 'heading',
    fontWeight: 700,
    textDecoration: 'none',
    ':hover': {
      color: brandBlue,
    },
  },
  metaText: {
    fontSize: 1,
    color: 'omega',
    lineHeight: 1.5,
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    px: 2,
    py: 1,
    borderRadius: '999px',
    bg: '#f4f5f8',
    fontSize: 0,
    fontWeight: 700,
    color: 'omegaDark',
    width: 'fit-content',
  },
  openButton: {
    px: 3,
    py: 2,
    borderRadius: '12px',
    bg: '#111111',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    ':hover': {
      bg: '#262626',
    },
  },
  emptyState: {
    textAlign: 'center',
    py: 5,
    color: 'omega',
  },
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '')

const repairMojibake = (value) => {
  if (typeof value !== 'string' || !/[ÃÂâ€]/.test(value)) return value

  try {
    return decodeURIComponent(escape(value))
  } catch {
    return value
  }
}

const normalizeEntryText = (node) => ({
  ...node,
  title: repairMojibake(node.title),
  excerpt: repairMojibake(node.excerpt),
  canon_sequence: repairMojibake(node.canon_sequence),
  category: node.category
    ? {
        ...node.category,
        name: repairMojibake(node.category.name),
      }
    : node.category,
})

const highlightText = (value, query, highlightSx) => {
  const text = String(value || '')
  const normalizedQuery = query.trim()

  if (!normalizedQuery) return text

  const matcher = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig')
  const parts = text.split(matcher)

  if (parts.length === 1) return text

  return parts.map((part, index) =>
    part.toLowerCase() === normalizedQuery.toLowerCase() ? (
      <Box as='mark' sx={highlightSx} key={`${part}-${index}`}>
        {part}
      </Box>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  )
}

const safeNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const formatEntryLabel = (node, texts) => {
  const chapter = safeNumber(node.chapter)
  const subchapter = safeNumber(node.subchapter)

  if (chapter !== null) {
    const hasPart = subchapter !== null && subchapter > 0
    return hasPart
      ? `${texts.book} · ${texts.chapter} ${chapter}.${subchapter}`
      : `${texts.book} · ${texts.chapter} ${chapter}`
  }

  if (node.canon_phase === 'prologue') return texts.proseLabel
  if (node.canon_phase === 'lore') return texts.loreLabel
  return texts.uncategorized
}

const buildSearchHaystack = (node) => {
  return [
    node.title,
    node.category?.name,
    node.canon_sequence,
    node.canon_phase,
    node.chapter,
    node.subchapter,
    node.excerpt,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const groupEntries = (items, texts, sortMode) => {
  if (sortMode !== 'reading') {
    return [
      {
        label: texts.sortedResults,
        nodes: items,
        icon: sortMode === 'newest' ? FaClock : FaSortAlphaDown,
      },
    ]
  }

  const chapterEntries = items.filter((item) => safeNumber(item.chapter) !== null)
  const prologueEntries = items.filter((item) => safeNumber(item.chapter) === null && item.canon_phase === 'prologue')
  const loreEntries = items.filter((item) => safeNumber(item.chapter) === null && item.canon_phase === 'lore')
  const otherEntries = items.filter(
    (item) => safeNumber(item.chapter) === null && !['prologue', 'lore'].includes(item.canon_phase)
  )

  const chapterGroupsMap = new Map()
  chapterEntries.forEach((item) => {
    const chapter = safeNumber(item.chapter)
    const key = `${texts.book} · ${texts.chapter} ${chapter}`
    if (!chapterGroupsMap.has(key)) chapterGroupsMap.set(key, [])
    chapterGroupsMap.get(key).push(item)
  })

  const chapterGroups = Array.from(chapterGroupsMap.entries()).map(([label, nodes]) => ({
    label,
    nodes,
    icon: FaBookOpen,
  }))

  const extras = []
  if (prologueEntries.length) {
    extras.push({ label: texts.proseLabel, nodes: prologueEntries, icon: FaFeatherAlt })
  }
  if (loreEntries.length) {
    extras.push({ label: texts.loreLabel, nodes: loreEntries, icon: FaFeatherAlt })
  }
  if (otherEntries.length) {
    extras.push({ label: texts.uncategorized, nodes: otherEntries, icon: FaBookOpen })
  }

  return [...chapterGroups, ...extras]
}

const ReadIndexPage = (props) => {
  const { language } = React.useContext(LanguageContext)
  const texts = copy[language === 'es' ? 'es' : 'en']
  const labels = phaseLabels(texts)
  const data = useStaticQuery(readIndexQuery)
  const [query, setQuery] = React.useState('')
  const [phaseFilter, setPhaseFilter] = React.useState('all')
  const [sortMode, setSortMode] = React.useState('reading')

  const entries = React.useMemo(() => {
    const nodes = data?.allArticle?.nodes || []
    return nodes
      .filter((node) => node.language === language && !node.link)
      .map(normalizeEntryText)
      .sort((a, b) => {
        const orderA = safeNumber(a.order) ?? Number.MAX_SAFE_INTEGER
        const orderB = safeNumber(b.order) ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) return orderA - orderB

        const chapterA = safeNumber(a.chapter) ?? Number.MAX_SAFE_INTEGER
        const chapterB = safeNumber(b.chapter) ?? Number.MAX_SAFE_INTEGER
        if (chapterA !== chapterB) return chapterA - chapterB

        const subA = safeNumber(a.subchapter) ?? 0
        const subB = safeNumber(b.subchapter) ?? 0
        if (subA !== subB) return subA - subB

        return a.title.localeCompare(b.title)
      })
  }, [data, language])

  const filteredEntries = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const matchedEntries = entries.filter((node) => {
      if (phaseFilter !== 'all' && node.canon_phase !== phaseFilter) {
        return false
      }

      if (!normalizedQuery) return true
      return buildSearchHaystack(node).includes(normalizedQuery)
    })

    return [...matchedEntries].sort((a, b) => {
      if (sortMode === 'alphabetical') {
        return a.title.localeCompare(b.title)
      }

      if (sortMode === 'newest') {
        const orderA = safeNumber(a.order) ?? 0
        const orderB = safeNumber(b.order) ?? 0
        if (orderA !== orderB) return orderB - orderA
        return b.title.localeCompare(a.title)
      }

      const orderA = safeNumber(a.order) ?? Number.MAX_SAFE_INTEGER
      const orderB = safeNumber(b.order) ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB

      const chapterA = safeNumber(a.chapter) ?? Number.MAX_SAFE_INTEGER
      const chapterB = safeNumber(b.chapter) ?? Number.MAX_SAFE_INTEGER
      if (chapterA !== chapterB) return chapterA - chapterB

      const subA = safeNumber(a.subchapter) ?? 0
      const subB = safeNumber(b.subchapter) ?? 0
      if (subA !== subB) return subA - subB

      return a.title.localeCompare(b.title)
    })
  }, [entries, phaseFilter, query, sortMode])

  const groupedEntries = React.useMemo(
    () => groupEntries(filteredEntries, texts, sortMode),
    [filteredEntries, texts, sortMode]
  )

  const totalChapterCount = React.useMemo(() => {
    return new Set(entries.map((node) => safeNumber(node.chapter)).filter((value) => value !== null)).size
  }, [entries])

  const filters = [
    { key: 'all', label: texts.all },
    { key: 'main', label: labels.main },
    { key: 'prologue', label: labels.prologue },
    { key: 'lore', label: labels.lore },
  ]

  const sortOptions = [
    { key: 'reading', label: texts.readingOrder, icon: FaBookOpen },
    { key: 'alphabetical', label: texts.alphabetical, icon: FaSortAlphaDown },
    { key: 'newest', label: texts.newest, icon: FaClock },
  ]

  const starterLinks = language === 'es'
    ? [
        {
          label: 'Prólogo 1',
          title: 'La llamada a Zuraldi',
          description: 'La mejor puerta de entrada si quieres comenzar desde el inicio de la aventura.',
          url: '/la-llamada-a-zuraldi/',
        },
        {
          label: 'Capítulo 1',
          title: 'La Cámara Sagrada',
          description: 'Empieza directamente con Drusniel y vuelve al lore cuando quieras profundizar.',
          url: '/la-camara-sagrada/',
        },
        {
          label: 'Lore',
          title: 'La magia en Astalor',
          description: 'Explora la magia, el mundo y el contexto antes de seguir con la historia principal.',
          url: '/la-magia-en-astalor/',
        },
        {
          label: 'Regiones',
          title: 'Regiones de Astalor',
          description: 'Una ruta rápida para descubrir los lugares clave antes de leer más capítulos.',
          url: '/descubriendo-las-regiones-de-astalor/',
        },
      ]
    : [
        {
          label: 'Prologue 1',
          title: 'The Call to Zuraldi',
          description: 'The best entry point if you want to begin from the start of the adventure.',
          url: '/the-call-to-zuraldi/',
        },
        {
          label: 'Chapter 1',
          title: 'The Sacred Chamber',
          description: 'Jump straight into Drusniel’s story and circle back to lore whenever you want.',
          url: '/the-sacred-chamber/',
        },
        {
          label: 'Lore',
          title: 'Magic in Astalor',
          description: 'Explore the magic, world, and deeper context before continuing the main narrative.',
          url: '/magic-in-astalor/',
        },
        {
          label: 'Regions',
          title: 'Discovering the Regions of Astalor',
          description: 'A quick route for learning the key places before reading further chapters.',
          url: '/discovering-the-regions-of-astalor/',
        },
      ]

  return (
    <Layout {...props}>
      <Seo title={texts.title} />
      <Divider />
      <Stack>
        <Main>
          <PageTitle header={texts.introTitle} subheader={texts.introSubtitle} />

          <Box sx={styles.introPanel}>
            <Text sx={{ fontSize: 0, color: 'omega', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {texts.startHere}
            </Text>

            <Box sx={styles.introGrid}>
              {starterLinks.map((item) => (
                <Box key={item.url} sx={styles.introCard}>
                  <Box sx={styles.introPill}>
                    <FaFeatherAlt size={11} />
                    <span>{item.label}</span>
                  </Box>
                  <Text as='div' sx={{ minWidth: 0 }}>
                    <Link to={item.url} style={{ textDecoration: 'none' }}>
                      <Box as='span' sx={styles.introLink}>{item.title}</Box>
                    </Link>
                  </Text>
                  <Text sx={{ ...styles.metaText, mt: 2 }}>{item.description}</Text>
                </Box>
              ))}
            </Box>

            <Box sx={styles.introFooter}>
              <Text sx={styles.metaText}>{texts.continueWith}</Text>
              <Text sx={{ ...styles.metaText, mt: 2 }}>
                {texts.aboutLine}{' '}
                <Link to='/about/' style={{ textDecoration: 'none' }}>
                  <Box as='span' sx={styles.footerLink}>{texts.aboutLink}</Box>
                </Link>
              </Text>
              <Text sx={{ ...styles.metaText, mt: 2 }}>
                {texts.discordLine}{' '}
                <a
                  href='https://discord.gg/DfzAacZC'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none' }}
                >
                  <Box as='span' sx={styles.footerLink}>{texts.discordLink}</Box>
                </a>
              </Text>
            </Box>
          </Box>

          <PageTitle header={texts.title} subheader={texts.subtitle} />

          <Box sx={styles.topPanel}>
            <Flex sx={styles.statsRow}>
              <Box sx={styles.statCard}>
                <Text sx={{ fontSize: 0, color: 'omega', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {texts.indexLabel}
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: 700, color: 'heading', lineHeight: 1.1 }}>
                  {entries.length}
                </Text>
                <Text sx={styles.metaText}>{texts.results}</Text>
              </Box>
              <Box sx={styles.statCard}>
                <Text sx={{ fontSize: 0, color: 'omega', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {texts.book}
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: 700, color: 'heading', lineHeight: 1.1 }}>
                  {totalChapterCount}
                </Text>
                <Text sx={styles.metaText}>{texts.chapter}</Text>
              </Box>
              <Box sx={styles.statCard}>
                <Text sx={{ fontSize: 0, color: 'omega', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {texts.searchLabel}
                </Text>
                <Text sx={{ fontSize: 1, color: 'omegaDark', lineHeight: 1.5, mt: 2 }}>
                  {texts.browseHint}
                </Text>
              </Box>
            </Flex>

            <Flex sx={styles.controls}>
              <Box sx={styles.searchWrap}>
                <Box sx={styles.searchIcon}>
                  <FaSearch size={14} />
                </Box>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={texts.searchPlaceholder}
                  sx={styles.input}
                  aria-label={texts.searchLabel}
                />
              </Box>

              <Flex sx={{ ...styles.controlsStack, justifyContent: 'flex-end', flex: '1 1 auto' }}>
                <Flex sx={styles.filterWrap}>
                  <Flex sx={{ alignItems: 'center', gap: 2, color: 'omega', px: 2 }}>
                    <FaFilter size={13} />
                    <Text sx={{ fontSize: 0, fontWeight: 700 }}>{texts.indexLabel}</Text>
                  </Flex>
                  {filters.map((filter) => (
                    <Button
                      key={filter.key}
                      sx={styles.filterButton(phaseFilter === filter.key)}
                      onClick={() => setPhaseFilter(filter.key)}
                      disabled={phaseFilter === filter.key}
                    >
                      {filter.label}
                    </Button>
                  ))}
                  {query && (
                    <Button sx={styles.filterButton(false)} onClick={() => setQuery('')}>
                      {texts.clear}
                    </Button>
                  )}
                </Flex>

                <Flex sx={styles.filterWrap}>
                  <Flex sx={{ alignItems: 'center', gap: 2, color: 'omega', px: 2 }}>
                    <FaSortAlphaDown size={13} />
                    <Text sx={{ fontSize: 0, fontWeight: 700 }}>{texts.sortLabel}</Text>
                  </Flex>
                  {sortOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <Button
                        key={option.key}
                        sx={styles.sortButton(sortMode === option.key)}
                        onClick={() => setSortMode(option.key)}
                        disabled={sortMode === option.key}
                      >
                        <Icon size={13} />
                        <span>{option.label}</span>
                      </Button>
                    )
                  })}
                </Flex>
              </Flex>
            </Flex>

            <Text sx={styles.resultsMeta}>
              {filteredEntries.length} {texts.results}
            </Text>
          </Box>

          {groupedEntries.length ? (
            groupedEntries.map((group) => {
              const GroupIcon = group.icon
              return (
                <Box key={group.label} sx={styles.sectionCard}>
                  <Flex sx={styles.sectionHeader}>
                    <Flex sx={{ alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          bg: '#ffffff',
                          color: brandBlue,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 18px rgba(93, 127, 242, 0.12)',
                        }}
                      >
                        <GroupIcon size={14} />
                      </Box>
                      <Box>
                        <Text sx={{ fontSize: 2, fontWeight: 700, color: 'heading' }}>{group.label}</Text>
                        <Text sx={styles.metaText}>{group.nodes.length} {texts.results}</Text>
                      </Box>
                    </Flex>
                  </Flex>

                  {group.nodes.map((node, index) => (
                    <Box
                      key={node.id}
                      sx={{
                        ...styles.row,
                        borderTop: index === 0 ? 'none' : styles.row.borderTop,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={styles.chapterPill}>
                          <FaBookOpen size={11} />
                          <span>{highlightText(formatEntryLabel(node, texts), query, styles.highlight)}</span>
                        </Box>
                        <Text as='div' sx={{ fontSize: 2, minWidth: 0 }}>
                          <Link to={node.slug} style={{ textDecoration: 'none' }}>
                            <Box as='span' sx={styles.titleLink}>{highlightText(node.title, query, styles.highlight)}</Box>
                          </Link>
                        </Text>
                        {!!node.excerpt && (
                          <Text sx={{ ...styles.metaText, mt: 2 }}>
                            {highlightText(stripHtml(node.excerpt).slice(0, 150), query, styles.highlight)}
                            {stripHtml(node.excerpt).length > 150 ? '…' : ''}
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Box
                          sx={{
                            ...styles.categoryBadge,
                            ...(node.category?.color
                              ? {
                                  bg: node.category.color,
                                  color: getReadableColor(node.category.color),
                                  borderColor: node.category.color,
                                }
                              : null),
                          }}
                        >
                          {highlightText(node.category?.name || texts.uncategorized, query, styles.highlight)}
                        </Box>
                        <Text sx={{ ...styles.metaText, mt: 2 }}>
                          {highlightText(node.canon_sequence || node.date, query, styles.highlight)}
                        </Text>
                      </Box>

                      <Link to={node.slug} style={{ textDecoration: 'none' }}>
                        <Box as='span' sx={styles.openButton}>{texts.readNow}</Box>
                      </Link>
                    </Box>
                  ))}
                </Box>
              )
            })
          ) : (
            <Box sx={styles.sectionCard}>
              <Box sx={styles.emptyState}>{texts.noResults}</Box>
            </Box>
          )}
        </Main>
      </Stack>
    </Layout>
  )
}

export default ReadIndexPage
