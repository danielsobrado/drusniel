import React, { useContext } from 'react'
import { Link } from 'gatsby'
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

const CardBodyCategory = ({ variant, category, omitCategory, chapter, subchapter, canon_phase, canon_sequence, pov }) => {
    const { language } = useContext(LanguageContext)

    // Determine secondary tag label
    let tagLabel = null

    if (chapter) {
        if (subchapter) {
            tagLabel = language === 'es' ? `Capítulo ${chapter}.${subchapter}` : `Chapter ${chapter}.${subchapter}`
        } else {
            tagLabel = language === 'es' ? `Capítulo ${chapter}` : `Chapter ${chapter}`
        }
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

        // Map to display label
        if (phase === 'lore') {
            tagLabel = 'Lore'
        } else if (phase === 'prequel') {
            const label = language === 'es' ? 'Prólogo' : 'Prequel'
            tagLabel = `${label}${seqNum}`
        } else if (phase === 'prologue') {
            const label = language === 'es' ? 'Prólogo' : 'Prologue'
            tagLabel = `${label}${seqNum}`
        }
    }

    if (omitCategory && !tagLabel && !pov) return null

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
                        bg: 'muted',
                        color: 'text',
                        fontWeight: 'normal',
                        border: '1px solid',
                        borderColor: 'muted'
                    }}
                >
                    {tagLabel}
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
