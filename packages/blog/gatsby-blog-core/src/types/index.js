const fs = require('fs')
const path = require('path')

//Read file instead of require to take advantage of graphql syntax highlighting
module.exports = {
  interfaces: fs.readFileSync(path.join(__dirname, 'interfaces.gql'), 'utf8'),
  file: fs.readFileSync(path.join(__dirname, 'file.gql'), 'utf8')
}
