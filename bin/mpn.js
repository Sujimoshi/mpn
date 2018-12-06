#! /usr/bin/env node

const cli = require('../src/index.js')

cli(process.cwd(), process.argv, [
  require('../src/commands/link'),
  require('../src/commands/unlink'),
  require('../src/commands/start'),
  require('../src/commands/deps-diff'),
  require('../src/commands/config'),
  require('../src/commands/pack')
])
