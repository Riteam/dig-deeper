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

  componentDidMount() {
    let { id, index, dropHeight } = this.props
    if (id > 49 && dropHeight > 0) {
      console.log(123, dropHeight);
      console.log(index);
      let el = this.myRef.current
      // let Y = index / 7 | 0
      el.animate(
        [
          { transform: `translateY(-${dropHeight * 100}px)` },
          { transform: `translateY(0)` }
        ],
        {
          duration: 85 * dropHeight,
          easing: 'ease-in'
        }
      )
        .finished.then(res => {
          this.props.onFillEnd(this.props.index)
        });
    }
  }

  componentDidUpdate(prevProp) {
    let el = this.myRef.current

    if (this.props.tripled) {
      // el.animate(
      //   [
      //     { transform: `rotate(-90deg) scale()` },
      //     { transform: `translate(0)` }
      //   ],
      //   {
      //     duration: (Math.abs(x1 - x2) + Math.abs(y1 - y2)) * 85,
      //     easing: 'ease-in'
      //   }
      // );
    }
    else if (this.props.index !== prevProp.index) {
      // switch & drop animation
      let [x1, y1] = [prevProp.index % 7, prevProp.index / 7 | 0],
        [x2, y2] = [this.props.index % 7, this.props.index / 7 | 0]
      console.log(22, this.props.id, prevProp.index + '=>' + this.props.index);
      el.animate(
        [
          { transform: `translate(${(x1 - x2) * 100}px, ${(y1 - y2) * 100}px)` },
          { transform: `translate(0)` }
        ],
        {
          duration: (Math.abs(x1 - x2) + Math.abs(y1 - y2)) * 85,
          easing: 'ease-in'
        }
      )
        .finished.then(res => {
          this.props.onSwitchEnd(this.props.index)
        })
      // console.log(x1 - x2, y1 - y2, (Math.abs(x1 - x2) + Math.abs(y1 - y2)) * 100);
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
    if (this.props.tripled) classNames.push('tripled')
    if (this.props.on) classNames.push('on')

    return <div
      ref={this.myRef}
      style={style}
      className={classNames.join(' ')}
      onClick={this.props.onClick}
      onTransitionEnd={this.props.onDestroyEnd}
    >
      <p className="testfont">
        type:{this.props.type} <br />
        index:{this.props.index} <br />
        id:{this.props.id}
      </p>
    </div>
  }
}