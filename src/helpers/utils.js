const fs = require('fs')
const { resolve, basename } = require('path')
const childProcess = require('child_process')
const { debounce } = require('underscore')
const MPNError = require('./error')
const request = require('sync-request')
const semver = require('semver')
const storage = require('../services/storage')
const log = require('../services/logger')

const STRINGS = {
  ownValueText: 'Your own value: '
}

exports.resolvePackage = (packageNameOrPath) => {
  if (packageNameOrPath.includes('/')) {
    const result = resolve(process.cwd(), packageNameOrPath)
    if (!fs.existsSync(result + '/package.json')) throw MPNError.PACKAGE_NOT_FOUND(result)
    return result
  }
  let resolveDirsStr = storage.get('config.resolve') || ''
  const containerDir = resolveDirsStr.split(':').find(dir => {
    try {
      const some = fs.readdirSync(dir)
      return some.includes(packageNameOrPath)
    } catch (e) {
      return false
    }
  })
  if (!containerDir) throw MPNError.PACKAGE_NOT_FOUND(packageNameOrPath)
  return resolve(containerDir, packageNameOrPath)
}

/**
 * Get package`s package.json
 */
exports.getPackageMainFile = (packagePath) => {
  if (!fs.existsSync(packagePath + '/package.json')) throw new Error(`'${packagePath}' is not an npm package folder`)
  return require(`${packagePath}/package.json`)
}

/**
 * Run promise on serial
 * @param {[Promise]} funcs
 */
exports.promiseSerial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]))

/**
 * Get array of all symlinks(names) in folder. Used to determine npm linked packages
 * @param {string} path absolute path to folder
 */
exports.getAllSymlinksInFolder = (path) => {
  return fs.readdirSync(path)
    .filter((item) => fs.lstatSync(`${path}/${item}`).isSymbolicLink())
}

/**
 * Allow user to choose from list of values
 * @param {Array<string>} list - List of values
 */
exports.readFromList = (list, cursorStart = 0, ownValue = null, headerText = 'Choose item from list') => {
  return new Promise((resolve, reject) => {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    if (ownValue !== null) list.push({ ...ownValue, label: STRINGS.ownValueText + ownValue.value, isOwnValue: true })
    let cursorPosition = cursorStart

    const writeList = () => {
      console.clear()
      console.log(headerText)
      list.forEach((el, i) => {
        console.log(i === cursorPosition ? '•' : ' ', el.label)
      })
    }

    const readInput = (key) => {
      const switchMap = {
        '\u001B\u005B\u0041': () => { // up arrow
          cursorPosition = (cursorPosition - 1 + list.length) % list.length
        },
        '\u001B\u005B\u0042': () => { // down arrow
          cursorPosition = (cursorPosition + 1) % list.length
        },
        '\r': () => { // return
          console.clear()
          process.stdin.removeListener('data', readInput)
          process.stdin.setRawMode(false)
          resolve(list[cursorPosition])
        },
        '\u0003': () => { // ctrl + c
          process.exit()
        },
        'default': () => {
          const { value, isOwnValue } = list[cursorPosition]
          if (isOwnValue) {
            if (key === '\x7f') { // backspace
              const nextValue = value.toString().trim().substring(0, value.length - 1)
              list[cursorPosition].label = STRINGS.ownValueText + nextValue
              list[cursorPosition].value = nextValue
            } else {
              list[cursorPosition].label += key
              list[cursorPosition].value += key
            }
          }
        }
      }
      switchMap[key] ? switchMap[key]() : switchMap['default']()
      if (key !== '\r') return writeList()
    }

    process.stdin.on('data', readInput)
    writeList()
  })
}

/**
 * @param {string} command process to run
 * @param {string[]} args commandline arguments
 * @returns {Promise<void>} promise
 */
exports.exec = (command, args, cwd = process.cwd(), allowConsoleClear = true) => {
  const logger = log.namespace(basename(cwd))
  const executedCommand = childProcess.spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    cwd
  })

  executedCommand.stdout.on('data', message => {
    if (message.toString().length <= 1) return // ignore empty lines
    if (message.toString() === '\x1Bc' && !allowConsoleClear) return // Dont allow to make console clear
    logger.info(message.toString().replace(/[\r\n]/, ''))
  })

  /**
     * Normalize error output
     * Remove `npm ERR` | `npm WARN` prefixes and unnecessary line breaks
     * Add `STATUS <package>:` prefix instead
     */
  const debounceErrorOutput = debounce((err) => {
    errStr = ''
    const searchStr = err.toString().toUpperCase()
    const errorIndex = searchStr.indexOf('ERR')
    const isErrorInString = errorIndex !== -1
    const warningIndex = searchStr.indexOf('WARN')
    const isWarningInString = warningIndex !== -1
    let log = ((isErrorInString && isWarningInString) && errorIndex < warningIndex) || !isWarningInString
      ? logger.error : logger.warn
    const errorStringsArr = err.toString().replace(/ ?npm ?| ?ERR!? | ?WARN /g, '')
      .trim()
      .split('\n')
      .filter(el => el !== '')
    errorStringsArr.map(el => log(el))
    errorStringsArr.length >= 1 && console.log()
  })

  let errStr = ''
  executedCommand.stderr.on('data', (err) => {
    errStr += err.toString()
    debounceErrorOutput(errStr)
  })

  return new Promise((resolve, reject) => {
    executedCommand.on('error', error => {
      logger.close()
      reject(error)
    })

    executedCommand.on('exit', code => {
      logger.close()
      if (code === 0) {
        resolve()
      } else {
        reject(code)
      }
    })
  })
}

exports.checkUpdates = () => {
  try {
    const url = 'https://raw.githubusercontent.com/Sujimoshi/mpn/master/package.json'
    const lastMainFile = JSON.parse(request.default('GET', url).body.toString())
    const currentMainFile = require('../../package.json')
    const semverCurrent = semver.coerce(currentMainFile.version)
    const semverLast = semver.coerce(lastMainFile.version)
    if (semver.gt(semverLast, semverCurrent)) {
      log.info('+------------------------------------------------------+')
      log.info(`| New verison of mpn.cli is available: ${currentMainFile.version} -> ${lastMainFile.version}  |`)
      log.info(`| Use 'npm i -g mpn.cli' for update                    |`)
      log.info('+------------------------------------------------------+')
    }
  } catch (e) {}
}
