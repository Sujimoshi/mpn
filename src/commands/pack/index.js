const { basename } = require('path')
const utils = require('../../helpers/utils')
const log = require('../../services/logger')

const pack = (packageNameOrPath, CWD) => {
  const packagePath = utils.resolvePackage(packageNameOrPath)
  const packageName = basename(packagePath)
  const packageMainFile = utils.getPackageMainFile(packagePath)
  const afterPackName = `${packageMainFile.name}-${packageMainFile.version}.tgz`

  log.info(`Making 'npm pack ${packagePath}'`)

  return utils.exec(`npm`, ['pack', packagePath], CWD)
    .then(() => log.info(`Making 'npm install ${afterPackName}'`))
    .then(() => utils.exec(`npm`, ['install', afterPackName], CWD))
    .then(() => log.info(`Packing of package <${packageName}> finished successfully`))
}

module.exports = {
  name: 'pack',
  help: `
    mpn pack [package_name_or_path] - Pack and install package as file
  `,
  completion: () => {
    return utils.getResolveCompletions()
  },
  test: (argsStr) => /^(\S+)$/.test(argsStr),
  run: ([ packageNameOrPath ], CWD) => {
    return pack(packageNameOrPath, CWD)
  }
}
