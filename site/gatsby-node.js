const path = require('path')

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // Add @auth alias so packages can import Auth components
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@auth': path.resolve(__dirname, 'src/components/Auth'),
        '@authContext': path.resolve(__dirname, 'src/context'),
      }
    }
  })

  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-slick|slick-carousel|enquire\.js|whatwg-url/,
            use: loaders.null()
          }
        ]
      }
    })
  }
}
