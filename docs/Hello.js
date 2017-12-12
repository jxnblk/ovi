import React from 'react'
import connect from 'refunk'

const Hello = connect(class extends React.Component {
  render () {
    const { update, count } = this.props

    return (
      <React.Fragment>
        <title>Hello ovi</title>
        <Style />
        <h1 style={{ color: 'tomato' }}>
          Hello ovi {count}
        </h1>
        <pre>zero-config react dev environment and bundler</pre>
        <button
          onClick={e => update(dec)}
          children='-'
        />
        <button
          onClick={e => update(inc)}
          children='+'
        />
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
    __html: `*{box-sizing:border-box}:root{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0}`
  }}
/>

export default Hello
