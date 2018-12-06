const depsDiff = require('../index')
const fsMock = require('../../../__mocks__/fs')

describe('help command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run command', () => {
    depsDiff.run([ 'project-one', 'project-main' ], '')
    expect(this.mock.log.error.mock.calls[0][1]).toEqual("'project-one' version of 'some' is higher then in 'project-main' (2.0.0 > 1.0.0)")
    expect(this.mock.log.warn.mock.calls[0][1]).toEqual("'project-one' version of 'else' is lower then in 'project-main' (1.0.0 < 1.1.0)")
  })

  it('run command without second arg', () => {
    depsDiff.run([ 'project-one' ], '/projects/project-main')
    expect(this.mock.log.error.mock.calls[0][1]).toEqual("'project-one' version of 'some' is higher then in 'project-main' (2.0.0 > 1.0.0)")
    expect(this.mock.log.warn.mock.calls[0][1]).toEqual("'project-one' version of 'else' is lower then in 'project-main' (1.0.0 < 1.1.0)")
  })

  it('test args', () => {
    expect(depsDiff.test('project-one project-main', [ 'project-one', 'project-main' ])).toEqual(true)
    expect(depsDiff.test('project-one', [ 'project-one' ])).toEqual(true)
  })
})
