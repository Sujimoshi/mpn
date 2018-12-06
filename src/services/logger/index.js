const chalk = require('chalk')

exports.bgColors = [ 'bgBlue', 'bgBlueBright', 'bgMagenta', 'bgWhite', 'bgCyan' ]

exports.namespace = (name) => {
  const bgColor = exports.bgColors.pop()
  return {
    error: (msg) => exports.error(msg, chalk.black[bgColor](`<${name}>`)),
    warn: (msg) => exports.warn(msg, chalk.black[bgColor](`<${name}>`)),
    info: (msg) => exports.info(msg, chalk.black[bgColor](`<${name}>`)),
    close: () => {
      exports.bgColors.push(bgColor)
    }
  }
}

exports.error = (msg, namespace = '') => {
  const args = [ ...(namespace ? [namespace] : []), chalk.black.bgRed(' ERR '), msg ]
  console.error(...args)
}

exports.warn = (msg, namespace = '') => {
  const args = [ ...(namespace ? [namespace] : []), chalk.black.bgYellow(' WAR '), msg ]
  console.warn(...args)
}

exports.info = (msg, namespace = '') => {
  const args = [ ...(namespace ? [namespace] : []), chalk.black.bgGreen(' INF '), msg ]
  console.log(...args)
}
