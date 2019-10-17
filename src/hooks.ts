import { Reaction, observable } from 'mobx'
import { useState, useReducer, useEffect } from 'react'

export function useMobx<T extends {}>(value: T = <any>{}): T {
  const [state] = useState(() => observable(value))
  return state
}

export function useObserver<T>(fn: () => T) {
  const [_, forceUpdate] = useReducer(x => x + 1, 0)

  const [reaction] = useState(() => (
    new Reaction('observer()', () => {
      forceUpdate({})
    })
  ))

  const dispose = () => {
    if (!reaction.isDisposed) {
      reaction.dispose()
    }
  }

  useEffect(() => {
    return dispose
  }, [])

  let rendering!: T
  reaction.track(() => {
    try {
      rendering = fn()
    } catch (e) {
      dispose()
      throw e
    }
  })
  return rendering
}
