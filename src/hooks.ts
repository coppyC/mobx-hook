import { useState, useReducer, useEffect } from 'react'
import { Observer } from './Observer'

function useObserver<T>(observer: Observer<T>) {
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const keys = new Set<string>()
  const collectListener = observer.createListener(key => keys.add(key))

  Observer.onCollect(collectListener)
  setTimeout(() => Observer.unCollect(collectListener))

  useEffect(() => {
    const updateListener = observer.createListener(key => {
      if (keys.has(key)) forceUpdate(0)
    })
    Observer.onUpdate(updateListener)
    return () => Observer.unUpdate(updateListener)
  })
}

export function useData<T extends {}>(store: T): T {
  const [observer] = useState(() => new Observer(store))
  useObserver(observer)
  return observer.proxy
}

export function createStoreHook<T extends {}>(store: T) {
  const observer = new Observer(store)
  return function useStore() {
    useObserver(observer)
    return observer.proxy
  }
}
