const omelette = require('omelette')

module.exports = {
  setup: () => {
    process.exit = () => {}
    const completion = omelette('mpn')
    completion.cleanupShellInitFile()
    completion.setupShellInitFile()
    return completion
  },
  cleanup: () => {
    process.exit = () => {}
    const completion = omelette('mpn')
    completion.cleanupShellInitFile()
    return completion
  },
  complete: (tree) => {
    omelette('mpn').tree(tree).init()
  }
}
