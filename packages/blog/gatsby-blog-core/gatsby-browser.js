import { globalHistory } from '@reach/router'
// In gatsby-browser.js
import { LanguageProvider } from '@helpers-blog/useLanguageContext';

export const wrapRootElement = ({ element }) => (
  <LanguageProvider>
    {element}
  </LanguageProvider>
);

export const onRouteUpdate = () => {
  globalHistory.listen(args => {
    args.location.action = args.action
  })
}
