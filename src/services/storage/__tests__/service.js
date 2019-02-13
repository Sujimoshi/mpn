const mockFS = require('../../../__mocks__/fs')
const fs = require('fs')
const FileStorage = require('../service')
const { resolve } = require('path')

describe('FileStorage', () => {
  const STORAGE_PATH = resolve(process.env.HOME, '.mpn/storage.json')
  const createStorage = () => new FileStorage(STORAGE_PATH)

  beforeEach(() => {
    mockFS.mock()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockFS.restore()
  })

  it('should create storage file if it doesnt exist', () => {
    const fsStub = jest.spyOn(fs, 'existsSync').mockImplementation(() => false)
    fs.unlinkSync(STORAGE_PATH)
    createStorage()
    fsStub.mockRestore()
    expect(fs.existsSync(STORAGE_PATH)).toEqual(true)
  })

  it('should return empty object if storage file is empty', () => {
    const storage = createStorage()
    fs.writeFileSync(storage.path, '')
    expect(storage.getStorage()).toEqual({})
  })

  it('#get - should return undefined if property doesnt exist', () => {
    const storage = createStorage()
    expect(storage.get('test')).toEqual(undefined)
  })

  it('#get - should return property', () => {
    const storage = createStorage()
    expect(storage.get('config.resolve')).toEqual('/projects')
  })

  it('#get - should return all storage if path not passed', () => {
    const storage = createStorage()
    expect(storage.get()).toEqual({
      'config': {
        'resolve': '/projects'
      }
    })
  })

  it('#set - should set existing property', () => {
    const storage = createStorage()
    storage.set('config.resolve', '/some')
    expect(storage.get('config.resolve')).toEqual('/some')
    expect(storage.storage.config.resolve).toEqual('/some')
    const storageJson = JSON.parse(fs.readFileSync(storage.path).toString())
    expect(storageJson.config.resolve).toEqual('/some')
  })

  it('#set - should set not existing property', () => {
    const storage = createStorage()
    storage.set('some.some', 'some')
    expect(storage.get('some.some')).toEqual('some')
  })

  it('#ns - should set prefix to #get functionality', () => {
    const storage = createStorage()
    const config = storage.ns('config')
    expect(config.get()).toEqual({ resolve: '/projects' })
  })

  it('#ns - should set prefix to #set functionality', () => {
    const storage = createStorage()
    const config = storage.ns('config')
    config.set('resolve', 'some')
    expect(config.get()).toEqual({ resolve: 'some' })
  })
})
