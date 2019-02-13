const { basename, join } = require('path')
const utils = require('../../helpers/utils')
const log = require('../../services/logger')

const link = (args, CWD) => {
  if (args.includes('-l')) {
    return utils.getAllSymlinksInFolder(CWD + '/node_modules/').map(el => console.log(el))
  }
  const [ packageNameOrPath ] = args
  const packagePath = utils.resolvePackage(packageNameOrPath)
  const packageName = basename(packagePath)
  const localPackagePath = join(CWD, '/node_modules/', packageName)

  log.info(`Linking '${packageName}' to '${basename(CWD)}'`)

  return utils.exec(`rm`, ['-rf', localPackagePath])
    .then(() => utils.exec(`ln`, ['-s', packagePath, localPackagePath]))
}

module.exports = {
  name: 'link',
  completion: () => {
    return utils.getResolveCompletions()
  },
  help: `
    mpn link [package_name_or_path] - Link package to current
      -l - List all linked packages
  `,
  test: (argsStr) => /^(\S+)$/.test(argsStr),
  run: (args, CWD) => {
    return link(args, CWD)
  }
}
