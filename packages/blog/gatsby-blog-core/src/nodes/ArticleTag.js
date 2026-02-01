module.exports = (
  { node, actions, getNode, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions
  const { localPaths } = pluginOptions
  const { type } = node.internal

  const ARTICLE_TYPES = [
    'Mdx'
  ]
  const newNodeType = 'ArticleTag'

  if (ARTICLE_TYPES.includes(type)) {
    if (type === 'Mdx') {
      const fileNode = getNode(node.parent)
      const source = fileNode && fileNode.sourceInstanceName
      if (!localPaths.find(path => path.name === source)) return
    }

    const { tags, tags_array } = node.frontmatter || node

    let tagsToCreate = tags_array || tags || []

    // Create nodes
    // Ensure tagsToCreate is an array to prevent "forEach is not a function" error
    if (!Array.isArray(tagsToCreate)) {
      if (tagsToCreate) {
        // If it's a single value (string, etc), wrap it
        tagsToCreate = [tagsToCreate]
      } else {
        tagsToCreate = []
      }
    }

    tagsToCreate.forEach(tag => {
      const id = createNodeId(`${tag} >>> ${newNodeType}`)

      // Skip existing node
      if (getNode(id)) return

      const newNode = {
        id,
        name: tag,
        // language: node.language,
        parent: node.id,
        internal: {
          type: newNodeType
        }
      }
      newNode.internal.contentDigest = createContentDigest(newNode)

      createNode(newNode)
    })
  }
}
