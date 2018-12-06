const linkCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const utils = require('../../../helpers/utils')

describe('link command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
    this.execMock = jest.spyOn(utils, 'exec').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run command', () => {
    const promise = linkCommand.run([ 'project-two' ], '/projects/project-main')
    return promise.then(() => {
      expect(this.execMock.mock.calls[0]).toEqual(['rm', ['-rf', '/projects/project-main/node_modules/project-two']])
      expect(this.execMock.mock.calls[1]).toEqual(['ln', ['-s', '/projects/project-two', '/projects/project-main/node_modules/project-two']])
    })
  })

  it('run command with -l flag', () => {
    linkCommand.run([ '-l' ], '/projects/project-main')
    expect(this.mock.log.info).toHaveBeenCalledTimes(2)
    expect(this.mock.log.info.mock.calls[0]).toEqual([ 'project-one' ])
    expect(this.mock.log.info.mock.calls[1]).toEqual([ 'project-two' ])
  })

  it('test args', () => {
    expect(linkCommand.test('project', [ 'project' ])).toEqual(true)
    expect(linkCommand.test('-l', [ '-l' ])).toEqual(true)
    expect(linkCommand.test('project -l', [ 'project', '-l' ])).toEqual(false)
    expect(linkCommand.test('', [])).toEqual(false)
  })
})
