exports.factory = (scripts) => ({
  name: 'help',
  help: `
    mpn help - for help
  `,
  run: (args, CWD) => {
    scripts.forEach(script => {
      console.log(script.help.replace(/\t/g, '  '))
    })
  }
})
