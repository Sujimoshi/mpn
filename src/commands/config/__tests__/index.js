const configCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const storage = require('../../../services/storage')

describe('config command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run get command', () => {
    configCommand.run([ 'get', 'resolve' ], '')
    expect(this.mock.log.info).toHaveBeenCalledWith('/projects')
  })

  it('run set command', () => {
    configCommand.run([ 'set', 'resolve=some' ], '')
    expect(this.mock.log.info).toHaveBeenCalledWith('some')
    expect(storage.getStorage()).toEqual({
      'config': {
        'resolve': 'some'
      }
    })
  })

  it('run failing command', () => {
    expect(() => configCommand.run([ 'some' ], '')).toThrowError()
  })

  it('test args', () => {
    expect(configCommand.test('get resolve', [ 'get', 'resolve' ])).toEqual(true)
    expect(configCommand.test('set resolve=some', [ 'set', 'resolve=some' ])).toEqual(true)
  })
})
