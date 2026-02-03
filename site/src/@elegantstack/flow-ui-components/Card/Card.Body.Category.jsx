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

const CardBodyCategory = ({ variant, category, omitCategory, chapter, subchapter, canon_phase }) => {
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

        // Map to display label
        if (phase === 'lore') {
            tagLabel = 'Lore'
        } else if (phase === 'prequel') {
            tagLabel = language === 'es' ? 'Prólogo' : 'Prequel'
        } else if (phase === 'prologue') {
            tagLabel = language === 'es' ? 'Prólogo' : 'Prologue'
        }
    }

    if (omitCategory && !tagLabel) return null

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
                        bg: 'muted', // Light grey usually
                        color: 'text',
                        fontWeight: 'normal',
                        // Optional: make it slightly distinct from category
                        border: '1px solid',
                        borderColor: 'muted'
                    }}
                >
                    {tagLabel}
                </Badge>
            )}
        </Box>
    )
}

export default CardBodyCategory
