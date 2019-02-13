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
    configCommand.run([ 'set', 'resolve=' + '/projects' ], '', [ configCommand ])
    expect(this.mock.log.info).toHaveBeenCalledWith('/projects')
    expect(storage.getStorage()).toEqual({
      'completion': {
        'tree': {
          'config': [ 'get', 'set' ]
        }
      },
      'config': {
        'resolve': '/projects'
      }
    })
  })

  it('run failing command', () => {
    expect(() => configCommand.run([ 'some' ], '')).toThrowError()
  })

  it('completion works correctly', () => {
    expect(configCommand.completion()).toEqual([ 'get', 'set' ])
  })

  it('test args', () => {
    expect(configCommand.test('get resolve', [ 'get', 'resolve' ])).toEqual(true)
    expect(configCommand.test('set resolve=some', [ 'set', 'resolve=some' ])).toEqual(true)
  })
})
