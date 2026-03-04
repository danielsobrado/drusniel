import React from 'react'
import { Box, Divider } from 'theme-ui'

const PostComments = ({ title, id }) => {
  if (typeof window === 'undefined') return null

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Disqus, CommentCount } = require('gatsby-plugin-disqus')

  let disqusConfig = {
    identifier: id,
    title: title
  }
  return (
    <Box>
      <Divider />
      <CommentCount config={disqusConfig} placeholder='' />
      <Disqus config={disqusConfig} />
    </Box>
  )
}

export default PostComments
