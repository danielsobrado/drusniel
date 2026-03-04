exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
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
