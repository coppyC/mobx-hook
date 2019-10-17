# mobx-hook
* a easy way to use mobx with react hook.
* only one api.

# what's my code look like ?
``` js
import React from 'react'
import { useMobx } from 'mobx-hook'

function Counter() {
  const state = useMobx({ x: 0 })
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
import { observable } from 'mobx'
import { useMobx } from 'mobx-hook'

const globalStore = observable({ x: 1 })

function Counter() {
  useMobx() // must write this line
  return (
    <button onClick={() => ++globalStore.x}>
      you click {globalStore.x} times.
    </button>
  )
}
```

# install
1. install package
```
yarn add mobx mobx-hook
```
2. add plugin to babel config
``` json
{
  "plugins": [
    "mobx-hook/babel-plugin"
  ]
}
```
3. code and enjoy it.
