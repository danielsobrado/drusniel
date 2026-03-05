import React, { useEffect } from 'react'
import { Card as CardComponent } from 'theme-ui'
import { Layout, Stack, Main, Sidebar, Hero } from '@layout'
import CardList from '@components/CardList'
import Card from '@components/Card'
import Divider from '@components/Divider'
import Sticky from '@components/Sticky'
import Seo from '@widgets/Seo'
import AuthorCompact from '@widgets/AuthorCompact'
import TableOfContentsCompact from '@widgets/TableOfContentsCompact'
import {
    PostBody,
    PostTagsShare,
    PostFooter
} from '@widgets/Post'
import { useContext } from 'react';
import { LanguageContext } from '@helpers-blog/useLanguageContext';
import { useAuth } from '@authContext/AuthContext';

const Post = ({
    data: { post, tagCategoryPosts, tagPosts, categoryPosts, previous, next },
    ...props
}) => {
    const { language } = useContext(LanguageContext);
    const { trackVisit } = useAuth();

    // Track this article as the user's latest read (logged-in users only)
    useEffect(() => {
        if (post?.slug && post?.title) {
            trackVisit(post.slug, post.title)
        }
    }, [post?.slug, post?.title, trackVisit])

    const relatedPosts = [
        ...(tagCategoryPosts ? tagCategoryPosts.nodes : []),
        ...(tagPosts ? tagPosts.nodes : []),
        ...(categoryPosts ? categoryPosts.nodes : [])
    ]
    const { pageContext: { services = {}, siteUrl } = {} } = props

    // Inject counterpartPath into pageContext for Layout/LanguageSwitch
    const modifiedProps = {
        ...props,
        pageContext: {
            ...props.pageContext,
            counterpartPath: post.counterpart_path
        }
    }

    const texts = {
        en: {
            relatedPostsTitle: 'Related Posts',
        },
        es: {
            relatedPostsTitle: 'Relacionados:',
        },
    };

    const { relatedPostsTitle } = texts[language];

    return (
        <Layout {...modifiedProps}>
            <Seo {...post} siteUrl={siteUrl} />
            <Hero full>
                <Card {...post} variant='horizontal-cover-hero' omitExcerpt />
            </Hero>
            <Divider />
            <Stack effectProps={{ fraction: 0 }}>
                <Main>
                    <CardComponent variant='paper'>
                        <PostBody {...post} />
                        <PostTagsShare {...post} location={props.location} />
                        <PostFooter {...{ previous, next }} />
                    </CardComponent>
                </Main>
                <Sidebar>
                    <AuthorCompact author={post.author} omitTitle />
                    <Divider />
                    <Sticky>
                        {post.tableOfContents?.items && (
                            <>
                                <TableOfContentsCompact {...post} />
                                <Divider />
                            </>
                        )}
                        {post.category && (
                            <CardList
                                title={relatedPostsTitle}
                                nodes={relatedPosts}
                                variant='horizontal-aside'
                                limit={6}
                                omitMedia
                                distinct
                                aside
                            />
                        )}
                    </Sticky>
                </Sidebar>
            </Stack>
        </Layout>
    )
}

export default Post
