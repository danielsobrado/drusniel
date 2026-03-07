import React from 'react'
import { IconButton, Heading, Flex } from 'theme-ui'
import attachSocialIcons from '@helpers/attachSocialIcons'

const getShareButtons = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    return require('react-share')
  } catch (error) {
    return {}
  }
}

const styles = {
  wrapper: {
    alignItems: `center`
  },
  heading: {
    color: `omegaDark`,
    mr: 1,
    mb: 0
  }
}

const PostShare = ({ location, title }) => {
  const shareButtons = getShareButtons()
  const {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    EmailShareButton
  } = shareButtons

  // During SSR, share buttons are undefined — bail out early to avoid
  // React.createElement(undefined, ...) which crashes build-html.
  if (!FacebookShareButton) return null

  const url = location && location.href

  const Facebook = ({ children }) => (
    <FacebookShareButton url={url} quote={title}>
      {children}
    </FacebookShareButton>
  )

  const Twitter = ({ children }) => (
    <TwitterShareButton url={url} title={title}>
      {children}
    </TwitterShareButton>
  )

  const Linkedin = ({ children }) => (
    <LinkedinShareButton url={url} quote={title}>
      {children}
    </LinkedinShareButton>
  )

  const Email = ({ children }) => (
    <EmailShareButton url={url} subject={title}>
      {children}
    </EmailShareButton>
  )

  const buttons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    email: Email
  }

  const buttonsWithIcons = attachSocialIcons(
    Object.keys(buttons).map(s => ({ name: s }))
  )

  return (
    <Flex sx={styles.wrapper}>
      <Heading variant='h5' sx={styles.heading}>
        Share
      </Heading>
      {buttonsWithIcons.map(({ name, color, Icon }) => {
        const ShareButton = buttons[name]
        return (
          ShareButton && (
            <IconButton
              as='span'
              variant='simple'
              key={`share-${name}`}
              sx={{ color, px: 1 }}
            >
              <ShareButton>
                <Icon />
              </ShareButton>
            </IconButton>
          )
        )
      })}
    </Flex>
  )
}

export default PostShare
