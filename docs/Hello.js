import React from 'react'
import connect from 'refunk'
import styled from 'styled-components'
import system from 'styled-system'

const { space } = system

const Box = styled.div([], space)

const Hello = connect(class extends React.Component {
  render () {
    const { update, count } = this.props

    return (
      <React.Fragment>
        <head>
          <title>Hello ovi</title>
          <meta name='viewport' content='width=device-width,initial-scale=1' />
          <Style />
        </head>
        <Box p={4}>
          <h1>
            Hello ovi {count}
          </h1>
          <h2>zero-config react dev environment and bundler</h2>
          <pre>npm i ovi</pre>
          <pre>ovi App.js --dev --open</pre>
          <pre>ovi App.js > index.html</pre>
          <button
            onClick={e => update(dec)}
            children='-'
          />
          <button
            onClick={e => update(inc)}
            children='+'
          />
        </Box>
      </React.Fragment>
    )
  }
})

Hello.defaultProps = {
  count: 0
}

const inc = s => ({ count: s.count + 1 })
const dec = s => ({ count: s.count - 1 })

const Style = () => <style
  dangerouslySetInnerHTML={{
    __html: `*{box-sizing:border-box}:root,body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0}`
  }}
/>

export default Hello
