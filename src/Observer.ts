type Opt = 'collect' | 'update'

function observable<T extends {}>(hostId: number, target: T, parentKey = ''): T {
  type Key = string|number|symbol
  const obj = new Map<Key, Function>()
  const fn = new Map<Key, Function>()
  const observableChil = (chiKey: Key, chil: any) => {
    const chilProxy = observable(hostId, chil, getKey(chiKey))
    obj.set(chiKey, chilProxy)
    return chilProxy
  }
  const bindFn = (k: Key, f: Function) => {
    const bindedFn = f.bind(proxy)
    fn.set(k, bindedFn)
    return bindedFn
  }
  const getKey = (key: Key) => `${parentKey}.${String(key)}`
  const proxy = new Proxy(target, {
    get(t, k) {
      const value = t[k]
      Observer.emit('collect', hostId, getKey(k))
      if (typeof value === 'object')
        if (obj.has(k)) return obj.get(k)
        else return observableChil(k, value)
      if (typeof value === 'function')
        if (fn.has(k)) return fn.get(k)
        else return bindFn(k, value)
      return value
    },
    set(t, k, v) {
      if (t[k] === v) return true // value don't has change
      if (obj.has(k)) obj.delete(k)
      if (fn.has(k)) fn.delete(k)
      try {
        t[k] = v
        Observer.emit('update', hostId, getKey(k))
        return true
      } catch {
        return false
      }
    }
  })
  return proxy
}

type ObserverListener = (hostId: number, key: string) => void
export class Observer<T extends {}> {
  static totalObserver = 0
  static collectListeners = new Set<ObserverListener>()
  static updateListeners = new Set<ObserverListener>()

  static onCollect(listener: ObserverListener) {
    this.collectListeners.add(listener)
  }
  static unCollect(listener: ObserverListener) {
    this.collectListeners.delete(listener)
  }
  static onUpdate(listener: ObserverListener) {
    this.updateListeners.add(listener)
  }
  static unUpdate(listener: ObserverListener) {
    this.updateListeners.delete(listener)
  }
  static emit(opt: Opt, hostId: number, key: string) {
    if (opt === 'collect')
      [...this.collectListeners].forEach(emit => emit(hostId, key))
    if (opt === 'update')
      [...this.updateListeners].forEach(emit => emit(hostId, key))
  }

  readonly id: number
  readonly target: T
  readonly proxy: T
  constructor(target: T) {
    this.id = ++Observer.totalObserver
    this.target = target
    this.proxy = observable(this.id, target)
  }
  createListener(listener: (key: string) => void): ObserverListener {
    return (hostId, key) => {
      if (this.id === hostId)
        listener(key)
    }
  }
}
