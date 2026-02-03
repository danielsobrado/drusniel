import React from 'react'
import { Text, useThemeUI, get } from 'theme-ui'
import rv from '@components/utils/buildResponsiveVariant'

const styles = {
    excerpt: {
        flex: `auto`,
        mb: 3
    }
}

const CardBodyExcerpt = ({ variant, excerpt, omitExcerpt }) => {
    const context = useThemeUI()

    const responsiveVariant = rv(variant, 'excerpt')

    const visibility = responsiveVariant.reduce(
        (mobileVisibility, variant) =>
            mobileVisibility === false &&
                get(context.theme, variant, {}).display === 'none'
                ? false
                : true,
        false
    )

    // Clean the excerpt to remove "Prequel | Title" prefix pattern
    let cleanedExcerpt = excerpt
    if (excerpt && typeof excerpt === 'string') {
        // Regex to match header prefixes:
        // Prequel | ...
        // Lore | ...
        // Chapter 1.1 | ...
        // Capítulo 1.1 | ...
        const headerPattern = /^(?:Prequel|Lore|Prologue|Prólogo|Part\s+\d+|Parte\s+\d+|Chapter\s+\d+(?:\.\d+)?|Cap[íi]tulo\s+\d+(?:\.\d+)?)\s*\|\s*/i

        // Replace the prefix
        cleanedExcerpt = cleanedExcerpt.replace(headerPattern, '')

        // Also sometimes it repeats the title after the pipe, e.g. "Prequel | Actual Title Actual Title..."
        // But removing the prefix is usually enough to let the prose start.
    }

    return !omitExcerpt && visibility ? (
        <Text
            variant='small'
            sx={{
                ...styles.excerpt,
                variant: responsiveVariant
            }}
        >
            {cleanedExcerpt}
        </Text>
    ) : null
}

export default CardBodyExcerpt
