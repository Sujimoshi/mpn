const fs = require('fs')

/**
 * FileStorage - Gives ability to create local storage using file system
 */
class FileStorage {
  constructor (path) {
    this.path = path
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, '{}')
    }
  }

  getStorage () {
    if (!this.storage) {
      const string = fs.readFileSync(this.path).toString()
      this.storage = string === '' ? {} : JSON.parse(string)
    }
    return this.storage
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
