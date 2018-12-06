const startCommand = require('../index')
const fsMock = require('../../../__mocks__/fs')
const utils = require('../../../helpers/utils')
const storage = require('../../../services/storage')

describe('start command', () => {
  beforeEach(() => {
    this.mock = fsMock.mock()
    this.execMock = jest.spyOn(utils, 'exec').mockImplementation(() => Promise.resolve())
    this.readerMock = jest.spyOn(utils, 'readFromList').mockImplementation((list) => Promise.resolve(list[0] || {
      'label': '"npm run start": "start"',
      'path': '/projects/project-one',
      'value': 'npm run start'
    }))
  })

  afterEach(() => {
    fsMock.restore(false)
  })

  it('run command', () => {
    storage.set('start.defaults.project-one.watch', 'npm run start')
    storage.set('start.defaults.project-main.start', 'npm run start')
    return startCommand.run([], '/projects/project-main').then(() => {
      expect(this.readerMock).toHaveBeenCalledWith([{
        'label': '"npm run start": "start"',
        'path': '/projects/project-main',
        'value': 'npm run start'
      }], 0, { 'path': '/projects/project-main', 'value': '' }, 'Chose script to run for <project-main>')
      expect(this.execMock).toHaveBeenCalledWith('npm run start', [], '/projects/project-main', false)
      expect(storage.get('start.defaults')).toEqual({
        'project-main': { 'start': 'npm run start' },
        'project-one': { 'watch': 'npm run start' }
      })
    })
  })

  it('run command on clean env', () => {
    storage.set('start', undefined)
    return startCommand.run([], '/projects/project-main').then(() => {
      expect(this.readerMock).toHaveBeenCalledWith([{
        'label': '"npm run start": "start"',
        'path': '/projects/project-main',
        'value': 'npm run start'
      }], 0, { 'path': '/projects/project-main', 'value': '' }, 'Chose script to run for <project-main>')
      expect(this.execMock).toHaveBeenCalledWith('npm run start', [], '/projects/project-main', false)
      expect(storage.get('start.defaults')).toEqual({
        'project-main': { 'start': 'npm run start' },
        'project-one': { 'watch': 'npm run start' }
      })
    })
  })

  it('test args', () => {
    expect(startCommand.test('', [])).toEqual(true)
    expect(startCommand.test('project', [ 'project' ])).toEqual(false)
  })
})
