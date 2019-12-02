import { Observer } from '../src/Observer'

afterAll(() => {
  Observer.collectListeners.clear()
  Observer.updateListeners.clear()
})

test('the same obj proxy reference', () => {
  const { proxy } = new Observer({ o: {} })
  expect(proxy.o).toBe(proxy.o)
})

describe('collect listener', () => {
  test('if the key be visited, the listener will be called', () => {
    const observer = new Observer({ x: 0 })
    const mockFn = jest.fn()
    Observer.onCollect(mockFn)
    observer.proxy.x
    expect(mockFn).toBeCalled()
    mockFn.mockClear()
    Observer.unCollect(mockFn)
    observer.proxy.x
    expect(mockFn).not.toBeCalled()
  })

  test('only self listener will be called', () => {
    const observer1 = new Observer({ x: 0 })
    const observer2 = new Observer({ x: 0 })
    const mockFn1 = jest.fn()
    const mockFn2 = jest.fn()
    const listener1 = observer1.createListener(mockFn1)
    const listener2 = observer2.createListener(mockFn2)
    Observer.onCollect(listener1)
    Observer.onCollect(listener2)
    observer1.proxy.x
    expect(mockFn1).toBeCalled()
    expect(mockFn2).not.toBeCalled()
    Observer.unCollect(listener1)
    Observer.unCollect(listener2)
  })

  test('visit `x`, will collect `.x`', () => {
    const observer = new Observer({ x: 0 })
    const listener = observer.createListener(key => {
      expect(key).toBe('.x')
    })
    Observer.onCollect(listener)
    observer.proxy.x
    Observer.unCollect(listener)
  })
})

describe('update listener', () => {
  test('if the key be updated, the listener will be called', () => {
    const observer = new Observer({ x: 0 })
    const mockFn = jest.fn()
    Observer.onUpdate(mockFn)
    observer.proxy.x = 1
    expect(mockFn).toBeCalled()
    mockFn.mockClear()
    Observer.unUpdate(mockFn)
    observer.proxy.x = 2
    expect(mockFn).not.toBeCalled()
  })

  test('only self listener will be called', () => {
    const observer1 = new Observer({ x: 0 })
    const observer2 = new Observer({ x: 0 })
    const mockFn1 = jest.fn()
    const mockFn2 = jest.fn()
    const listener1 = observer1.createListener(mockFn1)
    const listener2 = observer2.createListener(mockFn2)
    Observer.onUpdate(listener1)
    Observer.onUpdate(listener2)
    observer1.proxy.x = 1
    expect(mockFn1).toBeCalled()
    expect(mockFn2).not.toBeCalled()
    Observer.unUpdate(listener1)
    Observer.unUpdate(listener2)
  })

  test('update `x`, will get key `.x`', () => {
    const observer = new Observer({ x: 0 })
    const listener = observer.createListener(key => {
      expect(key).toBe('.x')
    })
    Observer.onUpdate(listener)
    observer.proxy.x = 1
    Observer.unUpdate(listener)
  })

  test('if the new value is same as the old value, the listener won"t be called', () => {
    const observer = new Observer({ x: 0 })
    const mockFn = jest.fn()
    const listener = observer.createListener(mockFn)
    Observer.onUpdate(listener)
    observer.proxy.x = 0
    expect(mockFn).not.toBeCalled()
    Observer.unUpdate(listener)
  })
})
