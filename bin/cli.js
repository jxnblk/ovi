#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const util = require('util')
const meow = require('meow')
const got = require('got')
const { pkg } = require('read-pkg-up').sync()
const open = require('opn')
const ora = require('ora')

const start = require('../lib')

require('update-notifier')({
  pkg: require('../package.json')
}).notify()

const writeFile = util.promisify(fs.writeFile)

const cli = meow(`
  Usage:
    $ ovi App.js

  Options:
    --dev, -D         Run in development mode
    --port, -p        Port for development server
    --open, -o        Open development server in default browser
    --out-dir, -d     Output directory for static rendering
`, {
  flags: {
    dev: {
      type: 'boolean',
      alias: 'D'
    },
    port: {
      type: 'string',
      alias: 'p'
    },
    open: {
      type: 'boolean',
      alias: 'o'
    },
    outDir: {
      type: 'string',
      alias: 'd'
    }
  }
})

const [ file ] = cli.input

if (!file) {
  console.log('ovi requires a file argument. Run ovi --help for more information.')
  process.exit(1)
}

const filename = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
const options = Object.assign({}, pkg.ovi, cli.flags)

if (options.outDir) {
  options.outDir = path.isAbsolute(options.outDir) ? options.outDir : path.join(process.cwd(), options.outDir)
}

let spinner
if (options.dev) {
  spinner = ora('starting dev server').start()
}

if (options.outDir) {
  spinner = ora('bundling app').start()
}

start(filename, options)
  .then(async server => {
    const { port } = server.address()
    const url = `http://localhost:${port}`
    if (options.dev) {
      spinner.succeed(`listening at ${url}`)
      if (options.open) open(url)
    } else {
      const response = await got(url)
      if (options.outDir) {
        if (!fs.existsSync(options.outDir)) fs.mkdirSync(options.outDir)
        const outfile = path.join(options.outDir, 'index.html')
        writeFile(outFile, response.body)
          .then(res => {
            spinner.succeed(`file saved to ${options.outDir}`)
          })
      } else {
        console.log(response.body)
      }
      server.close()
    }
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
