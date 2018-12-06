const log = require('../index')
const chalk = require('chalk')

describe('#log', () => {
  beforeEach(() => {
    this.logSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'log').mockImplementation()
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('#error - logs as console.error', () => {
    log.error('Some error')
    expect(this.logSpy.error).toHaveBeenCalledWith(chalk.black.bgRed(' ERR '), 'Some error')
  })

  it('#info - logs as console.log', () => {
    log.info('test')
    expect(this.logSpy.info).toHaveBeenCalledWith(chalk.black.bgGreen(' INF '), 'test')
  })

  it('#warn - logs as console.warn', () => {
    log.warn('test')
    expect(this.logSpy.warn).toHaveBeenCalledWith(chalk.black.bgYellow(' WAR '), 'test')
  })

  it('#namespace - should add prefix to all info messages', () => {
    expect(log.bgColors).toHaveLength(5)
    const logger = log.namespace('some')
    logger.info('test')
    expect(log.bgColors).toHaveLength(4)
    expect(this.logSpy.info).toHaveBeenCalledWith(
      chalk.black.bgCyan('<some>'),
      chalk.black.bgGreen(' INF '),
      'test'
    )
    logger.close()
  })

  it('#namespace - should add prefix to all error messages', () => {
    expect(log.bgColors).toHaveLength(5)
    const logger = log.namespace('some')
    logger.error('test')
    expect(log.bgColors).toHaveLength(4)
    expect(this.logSpy.error).toHaveBeenCalledWith(
      chalk.black.bgCyan('<some>'),
      chalk.black.bgRed(' ERR '),
      'test'
    )
    logger.close()
  })

  it('#namespace - should add prefix to all warn messages', () => {
    expect(log.bgColors).toHaveLength(5)
    const logger = log.namespace('some')
    logger.warn('test')
    expect(log.bgColors).toHaveLength(4)
    expect(this.logSpy.warn).toHaveBeenCalledWith(
      chalk.black.bgCyan('<some>'),
      chalk.black.bgYellow(' WAR '),
      'test'
    )
    logger.close()
  })
})
