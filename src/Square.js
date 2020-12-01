import React from 'react';
export default class Square extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: props.type,
      on: false
    }
  }

  render() {
    return <div className={`squares ${'t' + this.state.type} ${this.state.on ? 'on' : ''}`} onClick={() => this.setState({ on: true })}>
      {this.state.type}
    </div>
  }
}