import { random } from 'lodash';

import React from 'react';
import Square from './Square'

const boardArr = new Array(49).fill(1).map(i => random(1, 7))

console.log(boardArr)

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arr: boardArr,
    };
  }

  renderSquare(i, index) {
    return <Square type={i} key={index} />;
  }

  render() {
    return (
      <div className="container">
        {
          this.state.arr.map((item, index) => this.renderSquare(item, index))
        }
      </div>
    )
  }
}
