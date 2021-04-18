const query = `
  query BlogPostQuery($id: Int!) {
    post(id: $id) {
      id
      title
      body
      createdAt
    }
  }
`
const successBody = `<BlogPost post={post} />`

export default (file, api) => {
  const j = api.jscodeshift
  const root = j(file.source)

  const importComponent = j.importDeclaration(
    [j.importDefaultSpecifier(j.identifier('BlogPost'))],
    j.stringLiteral('src/components/BlogPost')
  )

  root.find(j.ExportNamedDeclaration).at(0).insertBefore(importComponent)

  root
    .find(j.VariableDeclarator, {
      id: {
        type: 'Identifier',
        name: 'QUERY',
      },
    })
    .replaceWith((nodePath) => {
      const { node } = nodePath
      node.init.quasi = j.templateLiteral(
        [j.templateElement({ raw: query, cooked: query }, true)],
        []
      )
      return node
    })

  root
    .find(j.Identifier, {
      type: 'Identifier',
      name: 'blogPost',
    })
    .replaceWith((nodePath) => {
      const { node } = nodePath
      node.name = 'post'
      return node
    })

  return root
    .find(j.VariableDeclarator, {
      id: {
        type: 'Identifier',
        name: 'Success',
      },
    })
    .replaceWith((nodePath) => {
      const { node } = nodePath
      node.init.body = successBody
      return node
    })
    .toSource()
}
