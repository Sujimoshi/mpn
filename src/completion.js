module.exports = () => {
  if (process.argv[2] && process.argv[2].includes('--comp')) {
    const completion = require('../src/services/completion')
    const storage = require('../src/services/storage')
    completion.complete(storage.get('completion.tree'))
  }
}
