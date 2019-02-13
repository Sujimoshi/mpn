const completion = require('../completion')

describe('completion', () => {
  beforeEach(() => {
    this.logStub = jest.spyOn(console, 'log').mockImplementation()
    this.exitStub = jest.spyOn(process, 'exit').mockImplementation()
    process.argv = [ 'node', 'mpn', '--completion' ]
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log completions for bash', () => {
    completion()
    expect(this.logStub).toHaveBeenCalled()
    expect(this.exitStub).toHaveBeenCalled()
  })
})
