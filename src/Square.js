import { transform } from 'lodash';
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
    let index = this.props.index,
      x = index % 7, y = index / 7 | 0

    let style = {
      transform: `translate(${x * 100}px, ${y * 100}px)`
    }

    if (this.props.type) classNames.push('t' + this.props.type)
    if (this.props.on) classNames.push('on')

    return <div
      style={style}
      className={classNames.join(' ')}
      onClick={this.props.onClick}
    >
      <p className="testfont">
        type:{this.props.type} <br />
        index:{this.props.index} <br />
        id:{this.props.id}
      </p>
    </div>
  }
}