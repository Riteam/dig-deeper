import React from 'react';
export default class Square extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

      on: false,
      // style: {}
    }
    this.myRef = React.createRef();
  }

  componentDidUpdate(prevProp) {
    if (this.props.index !== prevProp.index) {
      let [x1, y1] = [prevProp.index % 7, prevProp.index / 7 | 0],
        [x2, y2] = [this.props.index % 7, this.props.index / 7 | 0]
      console.log(22, this.props.id, prevProp.index + '=>' + this.props.index);
      let el = this.myRef.current
      console.log(el, x1, y1);
      el.animate(
        [
          { transform: `translate(${(x1 - x2) * 100}px, ${(y1 - y2) * 100}px)` },
          { transform: `translate(0)` }
        ],
        300
      );
    }
  }

  render() {
    // if (this.props.index <= 1) {
    //   // console.log(11, this.props);
    // }
    let classNames = ['squares']
    let index = this.props.index,
      x = index % 7, y = index / 7 | 0

    let style = {
      // transform: `translate(${x * 100}px, ${y * 100}px)`
    }

    if (this.props.type) classNames.push('t' + this.props.type)
    if (this.props.on) classNames.push('on')

    return <div
      ref={this.myRef}
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