/**
 * Default MPN Error
 */
class MPNError extends Error {
  constructor (message = 'MPN error', data = undefined) {
    super(message)
    this.code = 1
    this.data = data
  }

  static ARGS_ERROR (help) {
    return new MPNError(`Incorrect argument(s) usage.\n${help}`)
  }

  static SCRIPT_NOT_FOUND (scriptName) {
    return new MPNError(`There is no script with name '${scriptName}'`)
  }

  static PACKAGE_NOT_FOUND (packageName) {
    return new MPNError(`Cannot find package ${packageName}`)
  }
}

module.exports = MPNError
