type Babel = typeof import('@babel/core')

const pkgName = 'mobx-hook'
const useMobx = 'useMobx'
const useObserver = 'useObserver'

export default function (babel: Babel): babel.PluginObj {
  const t = babel.types
  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path
        if (node.source.value === pkgName) {
          const { specifiers } = node
          const specifierNames = specifiers.map(item => item.local.name)
          if (!specifierNames.includes(useMobx)) return
          const ImportSpecifier = (name: string) =>
            t.importSpecifier(t.identifier(name), t.identifier(name))
          if (!specifierNames.includes(useObserver))
            specifiers.push(ImportSpecifier(useObserver))
        }
      },
      CallExpression(path) {
        const { node } = path
        if (t.isIdentifier(node.callee) && node.callee.name === useMobx) {
          const fnPath = path.getFunctionParent()
          if (!fnPath) return
          const fnNode = fnPath.node
          // if have modify, return
          if (t.isBlockStatement(fnNode.body)) {
            const statements = fnNode.body.body
            if (statements.length === 1 && t.isReturnStatement(statements[0])) {
              const [returnStatement] = statements
              if (t.isCallExpression(returnStatement.argument)) {
                const callee = returnStatement.argument.callee
                if (t.isIdentifier(callee) && callee.name === useObserver) return
              }
            }
          }
          const { body } = fnNode
          fnNode.body = t.blockStatement([
            t.returnStatement(t.callExpression(
              t.identifier(useObserver),
              [t.arrowFunctionExpression([], body)]
            ))
          ])
        }
      }
    }
  }
}
