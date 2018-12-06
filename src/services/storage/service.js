const fs = require('fs')

/**
 * FileStorage - Gives ability to create local storage using file system
 */
class FileStorage {
  constructor (path) {
    this.path = path
  }

  getStorage () {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, '{}')
    }
    const string = fs.readFileSync(this.path).toString()
    return string === '' ? {} : JSON.parse(string)
  }

  ns (ns) {
    return {
      get: (path = '') => this.get(`${ns}.${path}`),
      set: (path, value) => this.set(`${ns}.${path}`, value)
    }
  }

  get (objectPath = '') {
    if (!objectPath) return this.getStorage()
    const result = objectPath.replace(/\.$/, '').split('.').reduce((temp, el) => {
      temp = temp[el] || { __fake__: true }
      return temp
    }, this.getStorage())
    return result.__fake__ ? undefined : result
  }

  set (objectPath, value) {
    let storage = this.getStorage()
    const arrPath = objectPath.split('.')
    const lastElement = arrPath.pop()
    const holder = arrPath.reduce((temp, key) => {
      temp[key] = temp[key] || {}
      return temp[key]
    }, storage)
    holder[lastElement] = value
    fs.writeFileSync(this.path, JSON.stringify(storage, null, 2))
  }
}

module.exports = FileStorage
