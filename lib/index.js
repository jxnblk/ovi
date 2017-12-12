require('babel-register')({
  presets: [
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-react',
  ].map(require.resolve)
})
const path = require('path')
const http = require('http')
const util = require('util')
const React = require('react')
const { renderToNodeStream } = require('react-dom/server')
const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const globals = require('rollup-plugin-node-globals')
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const uglify = require('rollup-plugin-uglify')
const { minify } = require('uglify-es')
const chokidar = require('chokidar')
const WebSocket = require('ws')
const portfinder = require('portfinder').getPortPromise

const config = {
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          require.resolve('babel-preset-env'),
          { modules: false }
        ],
        require.resolve('babel-preset-stage-0'),
        require.resolve('babel-preset-react')
      ],
      plugins: [
        require.resolve('babel-plugin-external-helpers')
      ]
    }),
    commonjs({
      include: /node_modules/,
      exclude: [
        'node_modules/process-es6/**'
      ],
      namedExports: {
        'node_modules/react/index.js': [
          'Children',
          'Component',
          'createElement'
        ],
        'node_modules/react-dom/index.js': ['render', 'hydrate']
      }
    }),
    globals(),
    resolve({
      browser: true,
      main: true
    }),
  ]
}

module.exports = async (input, options) => {
  const port = options.port || await portfinder()

  let watcher
  const socket = {}

  if (!options.dev) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }))
    config.plugins.push(uglify({}, minify))
  } else {
    socket.port = await portfinder({ port: port + 1 })
    const wss = new WebSocket.Server({ port: socket.port })
    wss.on('connection', ws => {
      socket.ws = ws
    })
  }

  const bundle = await rollup.rollup(Object.assign({
    input: path.join(__dirname, 'entry.js')
  }, config))
  const main = await bundle.generate({ format: 'iife' })

  if (options.dev) {
    watcher = rollup.watch(Object.assign({ input }, config))

    watcher.on('event', async e => {
      if (!socket.ws) return
      switch (e.code) {
        case 'BUNDLE_END':
          // unsure how this is supposed to work...
          // I assume this already should be built somewhere
          const next = await rollup.rollup(Object.assign({ input }, config))
          const user = await next.generate({
            format: 'iife',
            name: 'Component'
          })
          socket.ws.send(JSON.stringify({
            script: user.code
          }))
      }
    })
  }

  const app = http.createServer(async (req, res) => {
    res.write('<!DOCTYPE html><meta charset="utf-8"><div id=div>')

    try {
      delete require.cache[require.resolve(input)]
      const Component = require(input).default || require(input)
      const el = React.createElement(Component, options)
      const stream = renderToNodeStream(el)
      stream.pipe(res, { end: false })

      stream.on('end', async () => {
        const comp = await rollup.rollup(Object.assign({
          input,
          watch: options.dev && {
            chokidar: {
              ignoreIntial: true
            },
            exclude: [
              'node_modules/**'
            ]
          }
        }, config))
        const user = await comp.generate({ format: 'iife', name: 'Component' })
        res.write(`</div>`)
        res.write(`<script>${user.code}</script>`)
        res.write(`<script>${main.code}</script>`)
        res.write(script(socket.port))
        res.end()
      })
    } catch (err) {
      res.write(errStyles)
      res.write(err.toString())
      res.end()
    }
  })

  const server = await app.listen(port)

  server.on('close', e => {
    if (watcher) watcher.close()
  })

  return server
}

const errStyles = `<style>body{font-family:Menlo,monospace;padding:32px;color:white;background-color:red;}</style>`

const script = port => port ? `<script>
const socket = new WebSocket('ws://localhost:${port}')
socket.onmessage = msg => {
  const data = JSON.parse(msg.data)
  Component = eval(data.script)
  if (!window.app) return
  window.app.setState({ Component })
}
</script>` : ''
