const mockFS = require('../../../__mocks__/fs')
const fs = require('fs')
const FileStorage = require('../service')
const { resolve } = require('path')

describe('FileStorage', () => {
  beforeEach(() => {
    mockFS.mock()
    this.storage = new FileStorage(resolve(__dirname, '../../../../localStorage.json'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    mockFS.restore()
  })

  it('should create storage file if it doesnt exist', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation(() => false)
    fs.unlinkSync(this.storage.path)
    expect(this.storage.getStorage()).toEqual({})
  })

  it('should return empty object if storage file is empty', () => {
    fs.writeFileSync(this.storage.path, '')
    expect(this.storage.getStorage()).toEqual({})
  })

  it('#get - should return undefined if property doesnt exist', () => {
    expect(this.storage.get('test')).toEqual(undefined)
  })

  it('#get - should return property', () => {
    expect(this.storage.get('config.resolve')).toEqual('/projects')
  })

  it('#get - should return all storage if path not passed', () => {
    expect(this.storage.get()).toEqual({
      'config': {
        'resolve': '/projects'
      }
    })
  })

  it('#set - should set existing property', () => {
    this.storage.set('config.resolve', '/some')
    expect(this.storage.get('config.resolve')).toEqual('/some')
  })

  it('#set - should set not existing property', () => {
    this.storage.set('some.some', 'some')
    expect(this.storage.get('some.some')).toEqual('some')
  })

  it('#ns - should set prefix to #get functionality', () => {
    const config = this.storage.ns('config')
    expect(config.get()).toEqual({ resolve: '/projects' })
  })

  it('#ns - should set prefix to #set functionality', () => {
    const config = this.storage.ns('config')
    config.set('resolve', 'some')
    expect(config.get()).toEqual({ resolve: 'some' })
  })
})
