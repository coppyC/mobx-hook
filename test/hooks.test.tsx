import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { useData, createStoreHook } from '../src/hooks'

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

test('base test: auto render after the data has change', () => {
  function Test() {
    const state = useData({ x: 1 })
    return <button onClick={() => ++state.x}>{state.x}</button>
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})

test('deep key: auto render after the deep value has change', () => {
  function Test() {
    const state = useData({ o: { o: 1 } })
    return <button onClick={() => state.o = { o: 2 } }>{state.o.o}</button>
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})

test('custom hook: work in custom hook', () => {
  const useMyData = () => useData({ x: 1 })
  function Test() {
    const state = useMyData()
    return <button onClick={() => ++state.x}>{state.x}</button>
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})

test('bind this: this point to the target object', () => {
  function Test() {
    const state = useData({
      x: 1,
      add() { this.x ++ }
    })
    return <button onClick={state.add}>{state.x}</button>
  }
  render(<Test />)
  const button = document.querySelector('button')
  expect(button.textContent).toBe('1')
  act(() => { button.click() })
  expect(button.textContent).toBe('2')
})

test('global store', () => {
  const useUser = createStoreHook({
    name: '???',
    changeName() { this.name = 'coppy' }
  })
  function User() {
    const user = useUser()
    return <div id="user">{user.name}</div>
  }
  function ChangeUserNameButton() {
    const user = useUser()
    return <button onClick={user.changeName}>change name</button>
  }
  const Test = () => <>
    <User />
    <ChangeUserNameButton />
  </>
  render(<Test />)
  const button = document.querySelector('button')
  const userDiv = document.querySelector('#user')
  expect(userDiv.textContent).toBe('???')
  act(() => { button.click() })
  expect(userDiv.textContent).toBe('coppy')
})
