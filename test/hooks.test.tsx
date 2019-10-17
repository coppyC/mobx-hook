import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { useMobx, useObserver } from '../src/hooks'
import { observable } from 'mobx'

let container: HTMLDivElement

function render(element: JSX.Element) {
  act(() => { ReactDOM.render(element, container) })
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => { ReactDOM.render(<></>, container) })
  document.body.removeChild(container)
  void ((container as any) = null)
})


test('auto render after the data has change', () => {
  function Test() {
    const state = useMobx({ x: 1 })
    return useObserver(() => (
      <button onClick={() => ++state.x}>{state.x}</button>
    ))
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})

test('global data', () => {
  const store = observable({ x: 1 })
  function Test() {
    useMobx()
    return useObserver(() => (
      <button onClick={() => ++store.x}>{store.x}</button>
    ))
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})
