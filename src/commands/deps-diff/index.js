const { resolvePackage, getPackageMainFile } = require('../../helpers/utils')
const log = require('../../services/logger')
const semver = require('semver')
const utils = require('../../helpers/utils')

const showDepsDiff = (pathToPackageA, pathToPackageB) => {
  const packA = getPackageMainFile(pathToPackageA)
  const packB = getPackageMainFile(pathToPackageB)
  const packADeps = { ...packA.dependencies, ...packA.peerDependencies }
  const packBDeps = { ...packB.dependencies, ...packB.peerDependencies }
  Object.keys(packBDeps).forEach((name) => {
    const version = packBDeps[name]
    if (!packADeps || !packADeps[name]) return
    const currenVersion = semver.coerce(packADeps[name])
    const commonVersion = semver.coerce(version)
    if (!currenVersion || !commonVersion) return
    if (semver.gt(commonVersion, currenVersion)) {
      log.warn(`'${packA.name}' version of '${name}' is lower then in '${packB.name}' (${currenVersion} < ${commonVersion})`)
    }
    if (semver.lt(commonVersion, currenVersion)) {
      log.error(`'${packA.name}' version of '${name}' is higher then in '${packB.name}' (${currenVersion} > ${commonVersion})`)
    }
  })
}

module.exports = {
  name: 'deps-diff',
  help: `
    mpn deps-diff path_to_package [path_to_package - default to 'CWD'] - Get dependencies difference between given packages.
  `,
  completion: () => {
    const resolveCompletions = utils.getResolveCompletions()
    return resolveCompletions.reduce((temp, el) => {
      temp[el] = resolveCompletions
      return temp
    }, {})
  },
  test: (argsStr) => /^(\S+?)( \S+)?$/.test(argsStr),
  run: ([packA, packB], CWD) => {
    showDepsDiff(resolvePackage(packA), resolvePackage(packB || CWD))
  }
}
