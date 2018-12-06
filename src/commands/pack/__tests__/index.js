const packCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const utils = require('../../../helpers/utils')

describe('pack command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
    this.execMock = jest.spyOn(utils, 'exec').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run command', () => {
    const promise = packCommand.run([ 'project-two' ], '/projects/project-main')
    expect(this.execMock.mock.calls[0]).toEqual([ 'npm', [ 'pack', '/projects/project-two' ], '/projects/project-main' ])
    return promise.then(() => {
      expect(this.execMock.mock.calls[1]).toEqual([ 'npm', [ 'install', 'project-two-1.0.0.tgz' ], '/projects/project-main' ])
    })
  })

  it('test args', () => {
    expect(packCommand.test('project', [ 'project' ])).toEqual(true)
    expect(packCommand.test('project -l', [ 'project', '-l' ])).toEqual(false)
    expect(packCommand.test('', [])).toEqual(false)
  })
})
