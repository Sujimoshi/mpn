const cli = require('../index')
const helpScript = require('../commands/help')
const utils = require('../helpers/utils')
const log = require('../services/logger')

describe('cli core', () => {
  const fakeScript = {
    name: 'fake',
    run: jest.fn(),
    help: ''
  }
  const CWD = '/'

  beforeEach(() => {
    this.errorSpy = jest.spyOn(log, 'error').mockImplementation()
    this.exitSpy = jest.spyOn(process, 'exit').mockImplementation()
    jest.spyOn(utils, 'checkUpdates').mockImplementation()
    this.helpSpy = jest.fn()
    jest.spyOn(helpScript, 'factory').mockImplementation(() => ({
      name: 'help',
      run: this.helpSpy
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('run script', () => {
    cli(CWD, ['node', 'mpn', 'fake', 'arg'], [ fakeScript ])
    expect(fakeScript.run).toHaveBeenCalledWith(['arg'], CWD, [ fakeScript, helpScript.factory() ])
  })

  it('show help and error message if script not found', () => {
    cli(CWD, ['node', 'mpn', 'some', 'arg'], [ fakeScript ])
    expect(this.helpSpy).toHaveBeenCalledWith(['arg'], CWD)
    expect(this.exitSpy).toHaveBeenCalledWith(1)
    expect(this.errorSpy).toHaveBeenCalledWith("There is no script with name 'some'")
  })

  it('show help without error if script not provided', () => {
    cli(CWD, ['node', 'mpn'], [ fakeScript ])
    expect(this.helpSpy).toHaveBeenCalledWith([], CWD)
    expect(this.exitSpy).toHaveBeenCalledWith(0)
  })

  it('should correctly validate arguments', () => {
    fakeScript.test = jest.fn().mockImplementation(() => false)
    cli(CWD, ['node', 'mpn', 'fake', 'arg'], [ fakeScript ])
    expect(fakeScript.test).toHaveBeenCalledWith('arg', ['arg'])
    expect(this.exitSpy).toHaveBeenCalledWith(1)
    expect(this.errorSpy).toHaveBeenCalledWith('Incorrect argument(s) usage.\n')
  })

  it('should correctly catch unexpected errors', () => {
    const error = new Error()
    fakeScript.test = () => {
      throw error
    }
    cli(CWD, ['node', 'mpn', 'fake', 'arg'], [ fakeScript ])
    expect(this.exitSpy).toHaveBeenCalledWith(1)
    expect(this.errorSpy).toHaveBeenCalledWith(error)
  })
})
