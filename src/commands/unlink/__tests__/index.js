const unlinkCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const utils = require('../../../helpers/utils')

describe('unlink command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
    this.execMock = jest.spyOn(utils, 'exec').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run command', () => {
    const promise = unlinkCommand.run([ 'project-one' ], '/projects/project-main')
    return promise.then(() => {
      expect(this.execMock.mock.calls[0]).toEqual(['npm', ['install'], '/projects/project-main'])
      expect(this.execMock.mock.calls[1]).toEqual(['rm', ['-rf', '/projects/project-main/node_modules/project-two']])
      expect(this.execMock.mock.calls[2]).toEqual(['ln', ['-s', '/projects/project-two', '/projects/project-main/node_modules/project-two']])
    })
  })

  it('run command with --all flag', () => {
    const promise = unlinkCommand.run([ '--all' ], '/projects/project-main')
    return promise.then(() => {
      expect(this.execMock.mock.calls[0]).toEqual(['npm', ['install'], '/projects/project-main'])
    })
  })

  it('test args', () => {
    expect(unlinkCommand.test('project', [ 'project' ])).toEqual(true)
    expect(unlinkCommand.test('--all', [ '--all' ])).toEqual(true)
    expect(unlinkCommand.test('project --all', [ 'project', '--all' ])).toEqual(false)
    expect(unlinkCommand.test('', [])).toEqual(false)
  })
})
