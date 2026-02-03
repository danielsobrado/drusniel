exports.createSchemaCustomization = ({ actions }) => {
    const { createTypes } = actions

    // Extend the Article interface and MdxArticleProxy type with chapter/lore fields
    const typeDefs = `
    # Extend the Article interface
    interface Article implements Node {
      chapter: Int
      subchapter: Int
      canon_phase: String
      canon_sequence: String
    }

    # Extend the MdxArticleProxy type
    type MdxArticleProxy implements Node & Article {
      chapter: Int @proxyField(from: "parent.frontmatter.chapter")
      subchapter: Int @proxyField(from: "parent.frontmatter.subchapter")
      canon_phase: String @proxyField(from: "parent.frontmatter.canon_phase")
      canon_sequence: String @proxyField(from: "parent.frontmatter.canon_sequence")
    }
  `

    createTypes(typeDefs)
}
