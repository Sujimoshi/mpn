
class StreamMock {
  constructor () {
    this.subscribers = {}

    this.setRawMode = jest.fn()
    this.resume = jest.fn()
    this.setEncoding = jest.fn()

    this.on = jest.fn(this.on.bind(this))
    this.removeListener = jest.fn(this.removeListener.bind(this))
    this.write = jest.fn(this.write.bind(this))
    this.reset = jest.fn(this.reset.bind(this))
  }

  on (event, handler) {
    this.subscribers[event] = this.subscribers[event] || []
    this.subscribers[event].push(jest.fn(handler))
  }

  removeListener (event, handler) {
    this.subscribers[event] = this.subscribers[event] || []
    this.subscribers[event].filter(el => el !== handler)
  }

  write (arg) {
    this.subscribers.data = this.subscribers.data || []
    this.subscribers.data.map(handler => {
      handler && handler(arg)
    })
  }

  trigger (event, args = [ 0 ]) {
    this.subscribers[event] = this.subscribers[event] || []
    this.subscribers[event].map(handler => handler(...args))
  }

  reset () {
    this.subscribers = {}
  }
}

module.exports = StreamMock
