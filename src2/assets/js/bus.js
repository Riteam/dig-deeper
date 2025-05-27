import { Debug } from './config'

class EventBus {
  constructor() {
    this.events = {
      /* [eventName]: {
        isOnce: false,
        fn: fn
      }
      */
    }
  }

  on(key, fn) {
    this.events[key] = {
      once: false,
      fn
    }
  }
  off(key) {
    delete this.events[key]
  }
  once(key, fn) {
    this.events[key] = {
      once: true,
      fn
    }
  }
  emit(key, params) {
    setTimeout(() => {
      if (key in this.events) {
        let { once, fn } = this.events[key]
        // if (key in this.events) {
        if (once) delete this.events[key]
        fn(params)
        // }
      } else {
        Debug && console.warn(key + ' is no in events')
      }
    }, 0);
  }
}

export default new EventBus()