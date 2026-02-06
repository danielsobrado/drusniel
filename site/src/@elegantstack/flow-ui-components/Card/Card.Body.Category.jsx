import React, { useContext, useMemo } from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby'
import { Box, Badge, css } from 'theme-ui'
import rv from '@components/utils/buildResponsiveVariant'
import getReadableColor from '@components/utils/getReadableColor'
import { LanguageContext } from '@helpers-blog/useLanguageContext'

const styles = {
    container: {
        mb: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    badge: {
        mr: 2,
        mb: 1
    }
}

const chapterPartsQuery = graphql`
    query CardBodyCategoryChapterPartsQuery {
        allArticle(
            filter: { private: { ne: true }, draft: { ne: true }, chapter: { ne: null } }
        ) {
            nodes {
                chapter
                language
            }
        }
    }
`

const CardBodyCategory = ({ variant, category, omitCategory, chapter, subchapter, canon_phase, canon_sequence, pov, startHere }) => {
    const { language } = useContext(LanguageContext)
    const chapterPartsData = useStaticQuery(chapterPartsQuery)
    const chapterPartCounts = useMemo(() => {
        const counts = {}
        const nodes = chapterPartsData?.allArticle?.nodes || []

        nodes.forEach(node => {
            const chapterNumber = Number(node?.chapter)
            if (!Number.isInteger(chapterNumber)) return

            const nodeLanguage = node?.language === 'es' ? 'es' : 'en'
            if (!counts[nodeLanguage]) {
                counts[nodeLanguage] = {}
            }
            counts[nodeLanguage][chapterNumber] = (counts[nodeLanguage][chapterNumber] || 0) + 1
        })

        return counts
    }, [chapterPartsData])

    // Determine secondary tag label and type for styling
    let tagLabel = null
    let tagType = null // 'chapter', 'lore', or 'prologue'

    if (chapter) {
        const chapterNumber = Number(chapter)
        const subchapterNumber = Number(subchapter)
        const chapterCountForLanguage = chapterPartCounts?.[language]?.[chapterNumber] || 0
        const isSinglePartChapter = chapterCountForLanguage === 1
        const chapterLabelPrefix = language === 'es' ? `Cap\u00edtulo ${chapterNumber}` : `Chapter ${chapterNumber}`
        tagLabel = Number.isInteger(subchapterNumber) && !isSinglePartChapter
            ? `${chapterLabelPrefix}.${subchapterNumber}`
            : chapterLabelPrefix

        tagType = 'chapter'
    } else if (canon_phase) {
        // Normalize phase
        const phase = String(canon_phase).trim().toLowerCase()

        // Attempt to parse sequence number if available
        let seqNum = ''
        if (canon_sequence) {
            // Matches P-001, L-001, LUM-R-001 etc. -> 1
            const match = String(canon_sequence).match(/-0*(\d+)$/)
            if (match) {
                seqNum = ` ${match[1]}`
            }
        }

        // Map to display label - prequel and prologue both show as "Prologue"
        if (phase === 'lore') {
            tagLabel = 'Lore'
            tagType = 'lore'
        } else if (phase === 'prequel' || phase === 'prologue') {
            const label = language === 'es' ? 'Prólogo' : 'Prologue'
            tagLabel = `${label}${seqNum}`
            tagType = 'prologue'
        }
    }

    // Define tag styles based on type
    const getTagStyles = () => {
        switch (tagType) {
            case 'chapter':
                // Chapters: stronger, darker font
                return {
                    bg: 'transparent',
                    color: 'omegaDark',
                    fontWeight: 'bold',
                    border: '1px solid',
                    borderColor: 'omegaDark'
                }
            case 'lore':
                // Lore: soft fantasy color (muted purple/lavender)
                return {
                    bg: 'rgba(147, 112, 219, 0.15)',
                    color: '#6B5B95',
                    fontWeight: 'normal',
                    border: '1px solid',
                    borderColor: 'rgba(147, 112, 219, 0.3)'
                }
            case 'prologue':
                // Prologue: grey, subtle
                return {
                    bg: 'muted',
                    color: 'text',
                    fontWeight: 'normal',
                    border: '1px solid',
                    borderColor: 'muted'
                }
            default:
                return {
                    bg: 'muted',
                    color: 'text',
                    fontWeight: 'normal'
                }
        }
    }

    if (omitCategory && !tagLabel && !pov && !startHere) return null

    return (
        <Box css={css(styles.container)} sx={{ variant: rv(variant, 'category') }}>
            {!omitCategory && category && category.slug && (
                <Badge
                    variant='tag'
                    as={Link}
                    to={`/${language}${category.slug}`}
                    sx={{
                        ...styles.badge,
                        ...(category.color && {
                            bg: category.color,
                            color: getReadableColor(category.color)
                        })
                    }}
                >
                    {category.name}
                </Badge>
            )}

            {tagLabel && (
                <Badge
                    variant='tag'
                    sx={{
                        ...styles.badge,
                        ...getTagStyles(),
                        ...(startHere && {
                            bg: '#2e7d32',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: '#2e7d32'
                        })
                    }}
                >
                    {startHere
                        ? `${tagLabel} · ${language === 'es' ? 'Empieza aquí' : 'Start here'}`
                        : tagLabel}
                </Badge>
            )}

            {!tagLabel && startHere && (
                <Badge
                    variant='tag'
                    sx={{
                        ...styles.badge,
                        bg: '#2e7d32',
                        color: '#fff',
                        fontWeight: 'bold'
                    }}
                >
                    {language === 'es' ? 'Empieza aquí' : 'Start here'}
                </Badge>
            )}

            {pov && (
                <Badge
                    variant='tag'
                    sx={{
                        ...styles.badge,
                        bg: 'alpha',
                        color: 'omegaDark',
                        fontWeight: 'normal',
                        fontStyle: 'italic'
                    }}
                >
                    {pov}
                </Badge>
            )}
        </Box>
    )
}

export default CardBodyCategory
