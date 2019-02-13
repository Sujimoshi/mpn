const { basename, join } = require('path')
const utils = require('../../helpers/utils')
const log = require('../../services/logger')

const unlink = async (packageNameOrPath, CWD) => {
  if (packageNameOrPath === '--all') {
    log.info(`Making 'npm install'`)
    return utils.exec('npm', ['install'], CWD)
  }

  const packageName = basename(utils.resolvePackage(packageNameOrPath))
  const filtredLinkPackages = utils.getAllSymlinksInFolder(CWD + '/node_modules/')
    .reduce((temp, name) => {
      if (name === packageName) return temp
      return [ ...temp, [ name, utils.resolvePackage(name) ] ]
    }, [])

  log.info(`Unlinking '${packageName}' from '${basename(CWD)}'`)

  return utils.exec(`npm`, ['install'], CWD)
    .then(() => Promise.all(filtredLinkPackages.map(([linkingPackageName, linkingPackagePath]) => {
      const localPackagePath = join(CWD, '/node_modules/', linkingPackageName)
      return utils.exec(`rm`, ['-rf', localPackagePath])
        .then(() => utils.exec(`ln`, ['-s', linkingPackagePath, localPackagePath]))
    })))
}

module.exports = {
  name: 'unlink',
  help: `
    mpn unlink [package_name_or_path|--all] - Unlink package from current
      --all - unlink all
  `,
  test: (argsStr) => /^((\S+)|(--all))$/.test(argsStr),
  completion: () => {
    return [ ...utils.getResolveCompletions(), '--all' ]
  },
  run: ([packageName], CWD) => {
    return unlink(packageName, CWD)
  }
}
