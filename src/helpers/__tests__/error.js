const MPNError = require('../error')

describe('error', () => {
  it('initialize correctly', () => {
    const err = new MPNError()
    expect(err.message).toEqual('MPN error')
  })
})
