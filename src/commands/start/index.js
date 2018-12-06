const { basename } = require('path')
const utils = require('../../helpers/utils')
const log = require('../../services/logger')
const storage = require('../../services/storage')

module.exports = exports = {
  name: 'start',
  test: (args) => /^$/.test(args),
  help: `
    mpn start - Run build process in current package and all linked packages.
  `
}

const runWatcher = exports.runWatcher = (process, CWD) => {
  log.info(`Running '${process}' in <${basename(CWD)}>`)

  return utils.exec(process, [], CWD, false)
    .then(() => log.info(`Building package <${basename(CWD)}> finished successfully`))
}

const getScriptReader = exports.getScriptReader = (packagePath, defaultScript) => {
  const packageMainFile = utils.getPackageMainFile(packagePath)
  const scriptsList = Object.entries(packageMainFile.scripts || {}).map(([key, value]) => {
    return {
      label: `"npm run ${key}": "${value}"`,
      value: `npm run ${key}`,
      path: packagePath
    }
  })
  let cursorDefault = defaultScript ? scriptsList.findIndex(({ value }) => {
    return defaultScript === value
  }) : 0
  let ownValue = { path: packagePath, value: '' }
  if (cursorDefault === -1) {
    cursorDefault = scriptsList.length
    ownValue.value = defaultScript
  }
  return () => utils.readFromList(scriptsList, cursorDefault, ownValue,
    `Chose script to run for <${basename(packagePath)}>`)
}

exports.run = (args, CWD) => {
  let storageDefaults = storage.get('start.defaults') || {}
  const readPromises = utils.getAllSymlinksInFolder(CWD + '/node_modules/').map((packageName) => {
    const defaultScript = storageDefaults[packageName] || {}
    return getScriptReader(`${CWD}/node_modules/${packageName}`, defaultScript.watch)
  })
  const defaultScript = storageDefaults[basename(CWD)] || {}
  readPromises.push(getScriptReader(CWD, defaultScript.start))

  return utils.promiseSerial(readPromises).then((proceses) => {
    const lastProcess = proceses.pop()
    const procesesDefaults = proceses.reduce((temp, { path, value }) => {
      return {
        ...temp,
        [basename(path)]: {
          ...storageDefaults[basename(path)],
          watch: value
        }
      }
    }, {})
    procesesDefaults[basename(lastProcess.path)] = {
      ...storageDefaults[basename(lastProcess.path)],
      start: lastProcess.value
    }
    storage.set('start.defaults', storageDefaults = {
      ...storageDefaults,
      ...procesesDefaults
    })
    const processPromises = proceses.map(({ path, value }) => {
      return runWatcher(value, path)
    })
    processPromises.push(runWatcher(lastProcess.value, lastProcess.path))
    return Promise.all(processPromises)
  })
}
