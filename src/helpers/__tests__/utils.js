const utils = require('../utils')
const fs = require('fs')
const mockFS = require('../../__mocks__/fs')
const StreamMock = require('../../__mocks__/stream')
const MPNError = require('../error')
const childProcess = require('child_process')
const { delay } = require('underscore')
const chalk = require('chalk')
const request = require('sync-request')
const storage = require('../../services/storage')

describe('utils', () => {
  describe('#getResolveCompletions', () => {
    beforeEach(() => {
      mockFS.mock()
    })

    afterEach(() => {
      jest.restoreAllMocks()
      mockFS.restore()
    })

    it('Should return Array of all resolvable folders', () => {
      expect(utils.getResolveCompletions()).toEqual(['project-main', 'project-one', 'project-two'])
    })
  })

  describe('#generateCompletionTree', () => {
    it('Should generate correct completion tree', () => {
      expect(utils.generateCompletionTree([{
        name: 'script',
        completion: () => ([ 'get', 'set' ])
      }])).toEqual({ 'script': [ 'get', 'set' ] })
    })
  })

  describe('#resolvePackage', () => {
    beforeEach(() => {
      mockFS.mock()
    })

    afterEach(() => {
      jest.restoreAllMocks()
      mockFS.restore()
    })

    it('Should return path to package without changes if path was given', () => {
      expect(utils.resolvePackage('/projects/project-main')).toEqual('/projects/project-main')
      expect(utils.resolvePackage('./')).toEqual('/Users/sujimoshi/Projects/mpn')
    })

    it('Should resolve path to package from config.resolve', () => {
      expect(utils.resolvePackage('project-one')).toEqual('/projects/project-one')
    })

    it('Should fail if given wrong path', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(() => false)
      expect(() => utils.resolvePackage('/projects/not-exists')).toThrow(MPNError)
    })

    it('Should fail if package name cant be resolved', () => {
      storage.set('config.resolve', null)
      expect(() => utils.resolvePackage('not-exists')).toThrow(MPNError)
    })
  })

  describe('#getPackageMainFile', () => {
    beforeEach(() => {
      mockFS.mock()
    })

    afterEach(() => {
      mockFS.restore()
    })
    it('return `package.json` on given path', () => {
      const res = utils.getPackageMainFile('/projects/project-one')
      expect(res.name).toEqual('project-one')
    })

    it('throws error if package not found', () => {
      expect(() => utils.getPackageMainFile('/projects/not-exist')).toThrowError()
    })
  })

  describe('#promiseSerial', () => {
    it('should run promise in serial', (done) => {
      const resultArr = []
      const promiseDelay = (tm) => new Promise((resolve) => {
        delay(() => {
          resultArr.push(new Date().getTime())
          resolve(tm)
        }, tm)
      })
      utils.promiseSerial([() => promiseDelay(100), () => promiseDelay(200)]).then((res) => {
        expect(resultArr[1] - resultArr[0]).toBeGreaterThanOrEqual(198)
        expect(res).toHaveLength(2)
        done()
      })
    })
  })

  describe('#getAllSymlinksInFolder', () => {
    beforeEach(() => {
      mockFS.mock()
    })

    afterEach(() => {
      mockFS.restore()
    })

    it('should return all symlinks names founded in folder', () => {
      const res = utils.getAllSymlinksInFolder('/projects/project-main/node_modules')
      expect(res).toEqual(['project-one', 'project-two'])
    })
  })

  describe('#readFromList', () => {
    const stdinMock = new StreamMock()

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(process, 'stdin', 'get').mockImplementation(() => {
        return stdinMock
      })
    })

    afterEach(() => {
      stdinMock.reset()
      jest.restoreAllMocks()
    })

    it('should return item from list', (done) => {
      utils.readFromList([
        { label: 'first', value: 1 },
        { label: 'second', value: 2 }
      ]).then(choose => {
        expect(choose).toEqual({ label: 'first', value: 1 })
        done()
      })
      console.log('some', process.stdin)
      process.stdin.write('\r') // enter
    })

    it('should be able to choose item from list', (done) => {
      utils.readFromList([
        { label: 'first', value: 1 },
        { label: 'second', value: 2 }
      ]).then(choose => {
        expect(choose).toEqual({ label: 'second', value: 2 })
        done()
      })
      process.stdin.write('\u001B\u005B\u0042') // down
      process.stdin.write('\r') // enter
    })

    it('should be able to set own value', (done) => {
      utils.readFromList([
        { label: 'first', value: 1 },
        { label: 'second', value: 2 }
      ], 0, { value: 3 }).then(choose => {
        expect(choose).toEqual({ isOwnValue: true, label: 'Your own value: 5', value: '5' })
        done()
      })
      process.stdin.write('\u001B\u005B\u0041') // up arrow - should bring us to the end of list
      process.stdin.write('\x7f') // backspace
      process.stdin.write('5')
      process.stdin.write('\r') // enter
    })

    it('should not change item if it is not own field', (done) => {
      utils.readFromList([
        { label: 'first', value: 1 },
        { label: 'second', value: 2 }
      ], 0).then(choose => {
        expect(choose).toEqual({ label: 'second', value: 2 })
        done()
      })
      process.stdin.write('\u001B\u005B\u0041') // up arrow - should bring us to the end of list
      process.stdin.write('\x7f') // backspace
      process.stdin.write('5')
      process.stdin.write('\r') // enter
    })

    it('should correctly handle keyboard interrupt', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation()
      utils.readFromList([
        { label: 'first', value: 1 },
        { label: 'second', value: 2 }
      ], 0, { value: 3 }, 'Some text')
      process.stdin.write('\u0003') // ctrl + c
      expect(exitSpy).toHaveBeenCalled()
    })
  })

  describe('#exec', () => {
    const childProcessMock = new StreamMock()
    childProcessMock.stderr = new StreamMock()
    childProcessMock.stdout = new StreamMock()

    beforeEach(() => {
      this.spawnSpy = jest.spyOn(childProcess, 'spawn').mockImplementation(() => childProcessMock)
      this.errSpy = jest.spyOn(console, 'error')
      this.logSpy = {
        error: jest.spyOn(console, 'error').mockImplementation(),
        warn: jest.spyOn(console, 'warn').mockImplementation(),
        info: jest.spyOn(console, 'log').mockImplementation()
      }
    })

    afterEach(() => {
      childProcessMock.trigger('exit')
      childProcessMock.reset()
      childProcessMock.stderr.reset()
      childProcessMock.stdout.reset()
      jest.restoreAllMocks()
    })

    it('should spawn process and subscribe on events', () => {
      utils.exec('mpn', ['arg'], '/project')
      expect(this.spawnSpy).toHaveBeenCalled()
      expect(childProcessMock.on.mock.calls[0][0]).toEqual('error')
      expect(childProcessMock.on.mock.calls[1][0]).toEqual('exit')
      expect(childProcessMock.stdout.on.mock.calls[0][0]).toEqual('data')
      expect(childProcessMock.stderr.on.mock.calls[0][0]).toEqual('data')
    })

    it('should correctly process stdout', () => {
      utils.exec('mpn', ['arg'], '/project', false)
      childProcessMock.stdout.write('Some')
      expect(this.logSpy.info).toHaveBeenCalledWith(
        chalk.black.bgCyan('<project>'),
        chalk.black.bgGreen(' INF '),
        'Some'
      )
      childProcessMock.stdout.write('')
      expect(this.logSpy.info).toHaveBeenCalledTimes(1)
      childProcessMock.stdout.write('\x1Bc')
      expect(this.logSpy.info).toHaveBeenCalledTimes(1)
    })

    it('should correctly process stderr', (done) => {
      utils.exec('mpn', ['arg'], '/project')
      childProcessMock.stderr.write('ERR some')
      delay(() => {
        expect(this.logSpy.error).toHaveBeenCalledWith(
          chalk.black.bgCyan('<project>'),
          chalk.black.bgRed(' ERR '),
          'some'
        )
        done()
      }, 100)
    })

    it('should correctly process stderr warnings', (done) => {
      utils.exec('mpn', ['arg'], '/project')
      childProcessMock.stderr.write('WARN some')
      delay(() => {
        expect(this.logSpy.warn).toHaveBeenCalledWith(
          chalk.black.bgCyan('<project>'),
          chalk.black.bgYellow(' WAR '),
          'some'
        )
        done()
      }, 300)
    })

    it('should reject on error', (done) => {
      utils.exec('mpn', ['arg'], '/project').catch((e) => {
        expect(e).toEqual(1)
        done()
      })
      childProcessMock.trigger('error', [1])
    })

    it('should reject on exit with non zero code', (done) => {
      utils.exec('mpn', ['arg']).catch((e) => {
        expect(e).toEqual(1)
        done()
      })
      childProcessMock.trigger('exit', [1])
    })
  })

  describe('#checkUpdates', () => {
    beforeEach(() => {
      this.logSpy = jest.spyOn(console, 'log').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('chould log about version update', () => {
      jest.spyOn(request, 'default').mockImplementation(() => ({ body: '{ "version": "99.99.99" }' }))
      utils.checkUpdates()
      expect(this.logSpy).toHaveBeenCalled()
    })

    it('chould not log about version update if version is ok', () => {
      jest.spyOn(request, 'default').mockImplementation(() => ({ body: '{ "version": "0.0.1" }' }))
      utils.checkUpdates()
      expect(this.logSpy).not.toHaveBeenCalled()
    })

    it('should not throw error', () => {
      jest.spyOn(request, 'default').mockImplementation(() => ({ body: '}{' }))
      expect(() => utils.checkUpdates()).not.toThrowError()
    })
  })
})
