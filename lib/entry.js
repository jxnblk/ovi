import React from 'react'
import ReactDOM from 'react-dom'

const DEV = process.env.NODE_ENV !== 'production'

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      Component
    }
  }

  render () {
    const { Component } = this.state
    return React.createElement(Component, this.props)
  }
}

const div = DEV ? document.body : document.documentElement

window.app = ReactDOM.hydrate(
  React.createElement(App),
  div
)
