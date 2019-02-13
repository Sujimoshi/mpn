const { resolve } = require('path')
const FileStorage = require('./service')

const STORAGE_FOLDER = resolve(process.env.HOME, '.mpn')

module.exports = new FileStorage(resolve(STORAGE_FOLDER, 'storage.json'))
