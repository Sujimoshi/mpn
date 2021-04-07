const completionCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')

describe('completion command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('completion works correctly', () => {
    expect(completionCommand.completion()).toEqual([ 'setup', 'cleanup' ])
  })

  it('test args', () => {
    expect(completionCommand.test('setup', [ 'setup' ])).toEqual(true)
    expect(completionCommand.test('cleanup', [ 'cleanup' ])).toEqual(true)
    expect(completionCommand.test('', [ ])).toEqual(false)
  })
})
