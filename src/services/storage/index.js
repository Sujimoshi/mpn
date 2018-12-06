const { resolve } = require('path')
const FileStorage = require('./service')

module.exports = new FileStorage(resolve(__dirname, '../../../localStorage.json'))
