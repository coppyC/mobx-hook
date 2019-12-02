# mobx-hook
mobx-hook is a refactor version of mobx, design for react hook.

# install
use npm
```
npm i mobx-hook
```
or use yarn
```
yarn add mobx-hook
```

# how to use ?
``` js
import React from 'react'
import { useData } from 'mobx-hook'

function Counter() {
  const state = useData({ x: 0 })
  return (
    <button onClick={() => ++state.x}>
      you click {state.x} times.
    </button>
  )
}
```

# how to write the global store
``` jsx
import React from 'react'
import { createStoreHook } from 'mobx-hook'

const useStore = createStoreHook({
  click: 0,
  add() { this.click ++ }
})

function Counter() {
  const store = useStore()
  return (
    <button onClick={store.add}>
      you click {store.click} times total.
    </button>
  )
}
```
