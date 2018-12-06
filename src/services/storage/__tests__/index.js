const mockFS = require('../../../__mocks__/fs')
const storage = require('../index')
const FileStorage = require('../service')
const { resolve } = require('path')

describe('storage container', () => {
  beforeEach(() => {
    mockFS.mock()
  })

  afterEach(() => {
    mockFS.restore()
  })

  it('should return storage object', () => {
    expect(storage).toBeInstanceOf(FileStorage)
    expect(storage.path).toEqual(resolve(__dirname, '../../../../localStorage.json'))
  })
})
