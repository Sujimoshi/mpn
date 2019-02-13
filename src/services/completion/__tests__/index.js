const completion = require('../index')
const mockFS = require('../../../__mocks__/fs')
const fs = require('fs')
const { resolve } = require('path')

describe('completion service', () => {
  beforeEach(() => {
    this.mock = mockFS.mock()
  })

  afterEach(() => {
    mockFS.restore()
    jest.restoreAllMocks()
  })

  it('should setup completion correctly', () => {
    const complete = completion.setup()
    expect(complete.program).toBe('mpn')
    expect(fs.existsSync(resolve(process.env.HOME, '.mpn/completion.sh'))).toBe(true)
  })

  it('should cleanup completion correctly', () => {
    const complete = completion.cleanup()
    expect(complete.program).toBe('mpn')
    expect(() => fs.readFileSync(resolve(process.env.HOME, '.mpn/completion.sh')))
      .toThrowError('ENOENT')
  })
})
