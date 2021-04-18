const body = `
<article>
  <header>
    <h2 className="text-xl text-blue-700 font-semibold">
      <Link to={routes.blogPost({ id: post.id })}>{post.title}</Link>
    </h2>
  </header>
  <div className="mt-2 text-gray-900 font-light">{post.body}</div>
</article>
`

export default (file, api) => {
  const j = api.jscodeshift
  const root = j(file.source)

  const routerImport = j.importDeclaration(
    [
      j.importSpecifier(j.identifier('Link'), j.identifier('Link')),
      j.importSpecifier(j.identifier('routes'), j.identifier('routes')),
    ],
    j.stringLiteral('@redwoodjs/router')
  )

  root.find(j.VariableDeclaration).insertBefore(routerImport)

  return root
    .find(j.VariableDeclarator, {
      id: {
        type: 'Identifier',
        name: 'BlogPost',
      },
    })
    .replaceWith((nodePath) => {
      const { node } = nodePath
      node.init.params = [
        ...node.init.params,
        j.objectPattern([
          j.objectProperty(j.identifier('post'), j.identifier('post')),
        ]),
      ]
      node.init.body.body[0].argument = body
      return node
    })
    .toSource()
}
