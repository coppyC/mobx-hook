import { transform } from '@babel/core'
import plugin from '../src/babel'

describe('import declaration', () => {
  test('base test', () => {
    const example = 'import {useMobx} from "mobx-hook"'
    const { code } = transform(example, { plugins: [plugin] })
    expect(code).toContain('useObservable')
    expect(code).toContain('useObserver')
    expect(code).not.toContain('useMobx')
  })
  test('already have useObservable', () => {
    const example = 'import {useMobx, useObservable} from "mobx-hook"'
    const { code } = transform(example, { plugins: [plugin] })
    expect(code.match(/useObservable/g)).toHaveLength(1)
  })
  test('don\'t modify anything without useMobx', () => {
    const example = 'import {useObserver} from "mobx-hook"'
    const { code } = transform(example, { plugins: [plugin] })
    expect(code).not.toContain('useObservable')
  })
})

describe('function declaration', () => {
  test('base test', () => {
    const example = `
      function A() {
        const x = useMobx({a:1})
        return x.a
      }
    `
    const { code } = transform(example, { plugins: [plugin] })
    expect(code).toContain('useObservable')
    expect(code).toContain('useObserver')
    expect(code).toMatchSnapshot()
  })
  test('arrow function test', () => {
    const example = `
      const A = () => {
        const x = useMobx({a:1})
        return x.a
      }
    `
    const { code } = transform(example, { plugins: [plugin] })
    expect(code).toContain('useObservable')
    expect(code).toContain('useObserver')
    expect(code).toMatchSnapshot()
  })
  test('nested function test', () => {
    const example = `
      function A() {
        function B() {
          const x = useMobx({a:1})
          return x.a
        }
      }
    `
    const { code } = transform(example, { plugins: [plugin] })
    expect(code).toContain('useObservable')
    expect(code).toContain('useObserver')
    expect(code).toMatchSnapshot()
  })
  test('many useMobx in a function', () => {
    const example = `
      function A() {
        const x = useMobx({a:1})
        const y = useMobx({a:1})
        return x.a + y.a
      }
    `
    const { code } = transform(example, { plugins: [plugin] })
    expect(code.match(/useObserver/g)).toHaveLength(1)
    expect(code.match(/useObservable/g)).toHaveLength(2)
  })
})
