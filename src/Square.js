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
    let classNames = ['squares']
    if (this.props.type) classNames.push('t' + this.props.type)
    if (this.props.on) classNames.push('on')

    return <div
      className={classNames.join(' ')}
      onClick={this.props.onClick}
    >
      {this.props.type + ',' + this.props.index}
    </div>
  }
}