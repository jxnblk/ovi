import React from 'react'
import ReactDOM from 'react-dom'

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

window.app = ReactDOM.hydrate(
  React.createElement(App),
  div
)
