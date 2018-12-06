const { checkUpdates } = require('./helpers/utils')
const log = require('./services/logger')
const MPNError = require('./helpers/error')

module.exports = async (CWD, argv, scripts) => {
  try {
    const [ ,, scriptName, ...args ] = argv
    const helpScript = require('./commands/help').factory(scripts)
    scripts.push(helpScript)
    const script = scripts.find(el => el.name === scriptName)
    if (!script) {
      helpScript.run(args, CWD)
      if (scriptName !== undefined) throw MPNError.SCRIPT_NOT_FOUND(scriptName)
    } else {
      if (script.test && !script.test(args.join(' '), args)) {
        throw MPNError.ARGS_ERROR(script.help)
      }
      await script.run(args, CWD)
    }
    checkUpdates()
    process.exit(0)
  } catch (e) {
    log.error(e instanceof MPNError ? e.message : e)
    process.exit(e.code || 1)
  }
}
