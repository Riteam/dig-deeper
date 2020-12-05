import React from 'react';
import img1 from './assets/img/1.png'
import img2 from './assets/img/2.png'
import img3 from './assets/img/3.png'
import img4 from './assets/img/4.png'
import img5 from './assets/img/5.png'
import img6 from './assets/img/6.png'
import img7 from './assets/img/7.png'

const imgs = {
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
}

// 下标转坐标
function index2Coord(index) {
  const len = 7
  return [index % len, index / len | 0]
}

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
    let el = this.myRef.current,
      currIndex = this.props.index

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
      el.animate(
        [
          { transform: `translate(${(x1 - x2) * 100}px, ${(y1 - y2) * 100}px)`, zIndex: prevProp.on ? 2 : 1 },
          { transform: `translate(0)`, zIndex: prevProp.on ? 2 : 1 }
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
    } else if (this.props.to >= 0 && this.props.to !== prevProp.to) {
      console.log(this.props, '???');
      // fly to core animtion
      let [x1, y1] = index2Coord(currIndex),
        [x2, y2] = index2Coord(this.props.to)
      el.animate([
        { transform: `translate(0) scale(1)`, opacity: 1 },
        { transform: `translate(${(x2 - x1) * 60}px, ${(y2 - y1) * 60}px)scale(.5)`, opacity: 1 },
        { transform: `translate(${(x2 - x1) * 100}px, ${(y2 - y1) * 100}px)scale(0)`, opacity: .1 }
      ],
        {
          duration: 300,
          easing: 'linear',
          fill: 'forwards'
        })
    } else if (this.props.type === 8 && prevProp.type !== 8) {
      console.log(this.props, prevProp.type, '！！！')
      el.animate([
        {
          transform: `translateY(0) scale(1)`,
          backgroundImage: `url(${imgs[prevProp.type]})`,
          zIndex: 3
        },
        {
          transform: `translateY(50px) scale(0)`,
          zIndex: 3,
          offset: 0.8,
        },
        {
          transform: `translateY(0) scale(1)`,
          zIndex: 3
        },
      ],
        {
          duration: 400,
          easing: `cubic-bezier(.175, .885, .32, 1.275)`
        }).finished.then(res => {
          this.props.onDestroyEnd()
        })
    }
  }

  tnHandler = (e) => {
    if (e.propertyName === 'transform') {
      this.props.onDestroyEnd()
    }
  }
  render() {
    // if (this.props.index <= 1) {
    //   // console.log(11, this.props);
    // }
    let classNames = ['icon']
    let index = this.props.index

    if (this.props.type) classNames.push('t' + this.props.type)
    if (this.props.tripled) classNames.push('tripled')
    // if (this.props.on) classNames.push('on')
    if (this.props.to >= 0) classNames.push('to')

    return <div
      className={'squares ' + (this.props.on ? 'on' : '')}
      onClick={this.props.onClick}
    >
      <div
        ref={this.myRef}
        onTransitionEnd={this.tnHandler}
        className={classNames.join(' ')}></div>
      {/* <p className="testfont">
        type:{this.props.type} <br />
        index:{this.props.index} <br />
        id:{this.props.id}
      </p> */}
    </div>
  }
}