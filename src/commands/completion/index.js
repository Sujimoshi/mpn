const storage = require('../../services/storage')
const completion = require('../../services/completion')
const log = require('../../services/logger')
const utils = require('../../helpers/utils')

module.exports = {
  name: 'completion',
  help: `
    mpn completion [setup|cleanup] - initialize completion
      - Support 'zsh', 'bash', 'fish'
      - Requires 'bash-completion' package for bash
      - For 'bash' users on MacOS see https://davidalger.com/posts/bash-completion-on-os-x-with-brew/
  `,
  test: (argsStr) => /(setup|cleanup)/.test(argsStr),
  completion: () => [ 'setup', 'cleanup' ],
  run: ([ action ], CWD, scripts) => {
    if (action === 'setup') {
      const completeMPN = completion.setup()
      storage.set('completion.tree', utils.generateCompletionTree(scripts))
      if (completeMPN.getActiveShell() === 'bash') {
        log.warn(`For "bash" users, "bash-completion" package required.`)
        log.warn(`For "bash" on MacOS users see https://davidalger.com/posts/bash-completion-on-os-x-with-brew/`)
      }
      log.info('Completion setted up')
    } else if (action === 'cleanup') {
      completion.cleanup()
      storage.set('completion', undefined)
      log.info('Completion removed')
    }
  }
}
