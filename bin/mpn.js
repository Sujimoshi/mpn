#! /usr/bin/env node

require('../src/index.js')(process.cwd(), process.argv, [
  require('../src/commands/link'),
  require('../src/commands/unlink'),
  require('../src/commands/start'),
  require('../src/commands/deps-diff'),
  require('../src/commands/config'),
  require('../src/commands/pack'),
  require('../src/commands/completion')
])
