const helpScript = require('../index')

describe('help command', () => {
  const fakeScript = {
    name: 'fake',
    run: jest.fn(),
    help: `fake help`
  }
  const helpScriptInstance = helpScript.factory([ fakeScript ])

  beforeEach(() => {
    this.logSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  it('run command', () => {
    helpScriptInstance.run([], '')
    expect(this.logSpy).toHaveBeenCalledWith('fake help')
  })
})
