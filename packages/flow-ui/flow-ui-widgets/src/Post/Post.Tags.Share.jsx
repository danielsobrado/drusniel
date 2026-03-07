import React, { Suspense } from 'react'
import { Flex, Box, Divider } from 'theme-ui'
import { PostTags } from '@widgets/Post/Post.Tags'
import SaveProgressButton from '@auth/SaveProgressButton'

const PostShare = React.lazy(() => import('@widgets/Post/Post.Share'))

const styles = {
  flex: {
    alignItems: [`flex-start`, `center`],
    justifyContent: `space-between`,
    flexDirection: [`column`, `row`],
    gap: [1, 2],
    flexWrap: `wrap`,
    '& > div + div': {
      mt: [0, 0],
    }
  },
  actions: {
    display: `flex`,
    alignItems: `center`,
    justifyContent: `flex-end`,
    gap: [1, 2],
    flexWrap: `wrap`,
    ml: [0, `auto`],
  },
  saveButtonWrap: {
    display: `flex`,
    alignItems: `center`,
    minHeight: `1.75rem`,
    order: [2, 0],
  },
  shareWrap: {
    display: `flex`,
    alignItems: `center`,
    justifyContent: `flex-end`,
    order: [1, 0],
    '& > div': {
      justifyContent: `flex-end`,
    }
  }
}

export const PostTagsShare = ({ articlePath, ...props }) => (
  <Box>
    <Divider />
    <Flex sx={styles.flex}>
      <PostTags {...props} />
      <Box sx={styles.actions}>
        <Box sx={styles.saveButtonWrap}>
          <SaveProgressButton path={articlePath} title={props.title} />
        </Box>
        <Box sx={styles.shareWrap}>
          <Suspense fallback={null}>
            <PostShare {...props} />
          </Suspense>
        </Box>
      </Box>
    </Flex>
  </Box>
)
