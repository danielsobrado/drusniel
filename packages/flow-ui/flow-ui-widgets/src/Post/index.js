import React, { Suspense } from 'react'
export { PostBody } from './Post.Body'
export { default as PostComments } from './Post.Comments'
export { PostFooter } from './Post.Footer'
export { PostHead } from './Post.Head'
export { PostImage } from './Post.Image'
export { PostTagsShare } from './Post.Tags.Share'

const PostCommentsFacebookLazy = React.lazy(() =>
  import('./Post.Comments.Facebook')
)
export const PostCommentsFacebook = () => (
  <Suspense fallback={null}>
    <PostCommentsFacebookLazy />
  </Suspense>
)

const PostCommentsGraphLazy = React.lazy(() => import('./Post.Comments.Graph'))
export const PostCommentsGraph = () => (
  <Suspense fallback={null}>
    <PostCommentsGraphLazy />
  </Suspense>
)
