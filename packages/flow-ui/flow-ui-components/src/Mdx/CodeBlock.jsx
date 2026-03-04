import React, { Suspense } from 'react'
import { Styled } from 'theme-ui'

const isSSR = typeof window === 'undefined'

const Prism = !isSSR ? React.lazy(() => import('@theme-ui/prism')) : null

const CodeBlock = props => {
  if (isSSR || !Prism) {
    return <Styled.pre>{props.children}</Styled.pre>
  }
  return (
    // eslint-disable-next-line react/jsx-pascal-case
    <Suspense fallback={<Styled.pre>{props.children}</Styled.pre>}>
      <Prism {...props} />
    </Suspense>
  )
}

export default CodeBlock
