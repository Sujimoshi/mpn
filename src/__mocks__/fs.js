const fsMock = require('mock-fs')

let logsTemp = []
let errorsTemp = []
let warnsTemp = []
let logMock
let errorMock
let warnMock

exports.mock = () => {
  logMock = jest.spyOn(console, 'log').mockImplementation((...args) => {
    logsTemp.push(args)
  })
  errorMock = jest.spyOn(console, 'error').mockImplementation((...args) => {
    errorsTemp.push(args)
  })
  warnMock = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    warnsTemp.push(args)
  })
  return {
    log: {
      info: logMock,
      error: errorMock,
      warn: warnMock
    },
    fs: fsMock({
      './localStorage.json': JSON.stringify({
        config: {
          resolve: '/projects'
        }
      }),
      './package.json': '{}',
      '/projects': {
        'project-one': {
          'package.json': JSON.stringify({
            'name': 'project-one',
            'peerDependencies': {
              'some': '2.0.0',
              'else': '1.0.0',
              'foo': 'some'
            }
          })
        },
        'project-two': {
          'package.json': JSON.stringify({
            'name': 'project-two',
            'version': '1.0.0'
          })
        },
        'project-main': {
          'package.json': JSON.stringify({
            'name': 'project-main',
            'dependencies': {
              'some': '1.0.0',
              'else': '1.1.0',
              'any': '1.0.0',
              'foo': 'any'
            },
            'scripts': {
              'start': 'start'
            }
          }),
          'node_modules': {
            'project-one': fsMock.symlink({
              path: '/projects/project-one'
            }),
            'project-two': fsMock.symlink({
              path: '/projects/project-two'
            })
          }
        }
      }
    })
  }
}

exports.restore = (logAfter = true) => {
  logMock.mockRestore()
  errorMock.mockRestore()
  warnMock.mockRestore()
  fsMock.restore()
  if (logAfter) {
    logsTemp.map(el => console.log(...el))
    logsTemp = []
    errorsTemp.map(el => console.error(...el))
    errorsTemp = []
    warnsTemp.map(el => console.warn(...el))
    warnsTemp = []
  }
}
