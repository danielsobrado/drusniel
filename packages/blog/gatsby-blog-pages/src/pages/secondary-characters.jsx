import React from 'react'
import { Layout, Stack, Main } from '@layout'
import PageTitle from '@components/PageTitle'
import Divider from '@components/Divider'
import Seo from '@widgets/Seo'
import AuthorExpanded from '@widgets/AuthorExpanded'
import { useContext } from 'react';
import { useBlogAuthors } from '@helpers-blog'
import { LanguageContext } from '@helpers-blog/useLanguageContext';

const PageSecondaryCharacters = props => {
    const authors = useBlogAuthors('secondary');
    const { language } = useContext(LanguageContext);

    let header = 'Secondary Characters';
    if (language === "es") {
        header = 'Personajes Secundarios';
    }

    let subheader = 'Meet the supporting cast of Astalor — allies, rivals, and enigmatic figures whose stories weave through the shadows of the main narrative, shaping the world in ways both seen and unseen.';
    if (language === "es") {
        subheader = 'Conoce al elenco secundario de Astalor — aliados, rivales y figuras enigmáticas cuyas historias se entrelazan entre las sombras de la narrativa principal, dando forma al mundo de maneras vistas y ocultas.';
    }

    return (
        <Layout {...props}>
            <Seo title='Secondary Characters' />
            <Divider />
            <Stack effectProps={{ effect: 'fadeInDown' }}>
                <PageTitle
                    header={header}
                    subheader={subheader}
                />
            </Stack>
            <Stack>
                <Main>
                    {authors.map((author, i) => (
                        <React.Fragment key={`item-${i}`}>
                            <Divider />
                            <AuthorExpanded author={author} withLink />
                        </React.Fragment>
                    ))}
                </Main>
            </Stack>
        </Layout>
    )
}

export default PageSecondaryCharacters
