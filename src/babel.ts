type Babel = typeof import('@babel/core')

const useMobx = 'useMobx'
const useObservable = 'useObservable'
const useObserver = 'useObserver'

export default function testPlugin(babel: Babel): babel.PluginObj {
  const t = babel.types
  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path
        if (node.source.value === 'mobx-hook') {
          const { specifiers } = node
          const specifierNames = specifiers.map(item => item.local.name)
          if (!specifierNames.includes(useMobx)) return
          specifiers.splice(specifierNames.indexOf(useMobx), 1)
          const ImportSpecifier = (name: string) =>
            t.importSpecifier(t.identifier(name), t.identifier(name))
          if (!specifierNames.includes(useObservable))
            specifiers.push(ImportSpecifier(useObservable))
          if (!specifierNames.includes(useObserver))
            specifiers.push(ImportSpecifier(useObserver))
        }
      },
      CallExpression(path) {
        const { node } = path
        if (t.isIdentifier(node.callee) && node.callee.name === useMobx) {
          const fnNode = path.getFunctionParent().node
          node.callee.name = useObservable
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
