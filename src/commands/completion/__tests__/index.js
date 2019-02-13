const completionCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const storage = require('../../../services/storage')

describe('completion command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run setup command', () => {
    completionCommand.run([ 'setup' ], '', [])
    expect(storage.get('completion')).toEqual({ tree: {} })
    expect(this.mock.log.warn).toHaveBeenCalledTimes(2)
  })

  it('run cleanup command', () => {
    completionCommand.run([ 'cleanup' ], '', [])
    expect(storage.get('completion')).toEqual(undefined)
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
