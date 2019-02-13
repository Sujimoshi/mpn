const storage = require('../../services/storage')
const MPNError = require('../../helpers/error')
const utils = require('../../helpers/utils')

const config = storage.ns('config')

module.exports = {
  name: 'config',
  completion: () => [ 'get', 'set' ],
  help: `
    mpn config [get|set] [path][=value]
      Available options: 
      - resolve - Path to folder(s) where mpn will looks for modules by names
  `,
  test: (argsStr) => /^((get ?\S*)|(set \S+=\S+))$/.test(argsStr),
  run: ([action, pathValue], CWD, scripts) => {
    if (action === 'get') {
      console.log(config.get(pathValue))
    } else if (action === 'set') {
      const [ path, value ] = pathValue.split('=')
      config.set(path, value)
      storage.set('completion.tree', utils.generateCompletionTree(scripts))
      console.log(config.get(path))
    } else {
      throw MPNError.ARGS_ERROR(module.exports.help)
    }
  }
}
