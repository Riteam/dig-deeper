import { random } from 'lodash';

import React from 'react';
import Square from './Square'
import myEventBus from './assets/js/bus.js'

let idCounter = 0

function getNewBoard() {
  return new Array(49).fill(1).map(i => {
    return getNewItem()
  })
}

function getNewItem(dropHeight = 0) {
  return {
    type: random(1, 7),
    id: ++idCounter,
    dropHeight,
    tripled: false
  }
}

function nextFrame(fn) {
  setTimeout(fn, 0);
}

// get Manhattan Distance
function getManDis(p1, p2) {
  const len = 7
  let [x1, y1] = [p1 % len, p1 / len | 0]
  let [x2, y2] = [p2 % len, p2 / len | 0]

  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

// 下标转坐标
function index2Coord(index) {
  const len = 7
  return [index % len, index / len | 0]
}

// 获得形状的交点
function getShapeCenter(arr) {
  const len = 7
  for (let i of arr) {
    let x1 = i % len, y1 = i / len | 0, ji = 0
    for (; ji < arr.length; ji++) {
      let j = arr[ji]
      if (i === j) continue
      let x2 = j % len, y2 = j / len | 0
      if (Math.abs(x2 - x1) === 0 || Math.abs(y2 - y1) === 0) continue
      else break
    }
    if (ji === arr.length) return i
  }
  return false
}

function swap(arr, a, b) {
  let temp = arr[a]
  arr[a] = arr[b]
  arr[b] = temp
}

function findTriple(arr, startPoint) {
  let target = arr[startPoint].type,
    res = []

  function findAtX(pos) {
    let x = pos, row = [],
      xMin = (pos / 7 | 0) * 7,
      xMax = xMin + 6
    while ((x - 1) >= xMin && arr[x - 1]?.type === target) {
      x -= 1
    }
    while (x <= xMax && arr[x]?.type === target) {
      row.push(x++)
    }
    return row
  }

  function findAtY(pos) {
    let y = pos, col = []
    while (arr[y - 7]?.type === target) {
      y -= 7
    }
    while (arr[y]?.type === target) {
      col.push(y)
      y += 7
    }
    return col
  }

  let firstXArr = findAtX(startPoint),
    firstYArr = findAtY(startPoint)

  console.log(firstXArr, firstYArr);

  if (firstXArr.length >= 3) {
    res = res.concat(firstXArr)
    firstXArr.forEach(xi => {
      let YArr = findAtY(xi)
      console.log(4646, YArr);
      if (YArr.length >= 3) res = res.concat(YArr)
    })
  } else if (firstYArr.length >= 3) {
    res = res.concat(firstYArr)
    firstYArr.forEach(yi => {
      let XArr = findAtX(yi)
      console.log(4646, XArr);
      if (XArr.length >= 3) res = res.concat(XArr)
    })
  }
  console.log(4747, res);
  return []
}

const boardArr = getNewBoard()

// console.log(boardArr)

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boardArr: boardArr,
      selectedIndex: null,
    };

    // this.stateData = null
    this.stateFlag = 0
  }

  clickHandler(index) {
    // 空格不处理
    if (this.state.boardArr[index].tripled) return false

    let sIndex = this.state.selectedIndex

    if (this.state.boardArr[sIndex]) {
      if (index === sIndex) {
        // 取消选择
        this.setState({ selectedIndex: null })
        return
      }
      let distance = Math.abs(index - sIndex)
      // if (distance === 7 || distance === 1) {
      if (true) {
        // 是上下左右的相邻格子，可以交换
        let newBoardArr = [...this.state.boardArr]
        swap(newBoardArr, sIndex, index)
        this.setState({
          boardArr: newBoardArr,
          selectedIndex: null
        });

        myEventBus.once('switchEnd', () => {
          console.log(45666);
          this.digTriple([index, sIndex])
        })
        // this.stateData = [index, sIndex]
        this.stateFlag = 1

        // do switch animation...

        // setTimeout(() => {
        //   this.digTriple([index, sIndex])
        // }, 200);
        return
      }
    }

    // 选中格子
    this.setState({ selectedIndex: index })
  }

  // when switch animation end -> digTriple
  switchEndHandler(index) {
    console.log(55, index);
    myEventBus.emit('switchEnd', index)
    // if (this.stateFlag === 1) {
    //   this.digTriple(this.stateData)
    // }
  }

  // 寻找并消灭三连！
  digTriple(posArr = [...this.state.boardArr]) {
    console.log('%c* digTriple', 'color: red;');
    this.stateFlag = 2

    let needDestroyPos = []

    posArr.forEach(i => {
      let pos = findTriple(this.state.boardArr, i)
      // console.log(pos);
      if (pos.length >= 3) {
        needDestroyPos = needDestroyPos.concat(pos)
      }
    })

    if (needDestroyPos.length === 0) {
      this.stateFlag = 0
      console.log('失败');
      return false
    }

    let newBoardArr = [...this.state.boardArr]

    needDestroyPos.forEach(j => newBoardArr[j].tripled = true)
    this.setState({
      boardArr: newBoardArr,
      selectedIndex: null
    });
    myEventBus.once('destroyEnd', () => {
      console.log(66654);
      this.dropDown(needDestroyPos)
    })
  }

  destroyEndHandler(index) {
    console.log(77, index);
    myEventBus.emit('destroyEnd', index)
    // if (this.stateFlag === 2) {
    //   this.digTriple(this.stateData)
    // }
  }

  // 下落
  dropDown(posArr) {
    console.log('%c* dropDown', 'color: red;', posArr);
    this.stateFlag = 3

    let endPos = new Set(),
      emptyArrTotal = [],
      newBoardArr = [...this.state.boardArr]
    for (let pos of posArr) {
      endPos.add(42 + pos % 7)
    }
    // 得到底部坐标
    endPos = [...endPos]
    // 自底部向上遍历
    for (let epos of endPos) {
      let emptyArr = []
      while (epos >= 0) {
        if (newBoardArr[epos].tripled) {
          emptyArr.push(epos)
          epos -= 7
        }
        else if (emptyArr.length > 0) {
          let pos = emptyArr.shift()
          swap(newBoardArr, pos, epos)
        } else {
          epos -= 7
        }
      }
      emptyArrTotal = emptyArrTotal.concat(emptyArr)
    }
    console.log(endPos);
    this.setState({
      boardArr: newBoardArr
    })

    setTimeout(() => {
      // 填充结束后需要下落方块和填充方块一起检查是否有三连
      this.fillSquire(emptyArrTotal, posArr)
    }, 0);
  }

  fillSquire(posArr, dropedPosArr) {
    console.log('%c* fillSquire', 'color: red;', posArr);

    let dropCountPerCol = {},
      longestCol = 0,
      longestColCount = 0
    for (let pos of posArr) {
      let col = pos % 7
      if (col in dropCountPerCol) dropCountPerCol[col]++
      else dropCountPerCol[col] = 1
      if (dropCountPerCol[col] > longestColCount) {
        longestCol = col
        longestColCount = dropCountPerCol[col]
      }
    }
    let newBoardArr = [...this.state.boardArr]
    for (let pos of posArr) {
      newBoardArr[pos] = getNewItem(dropCountPerCol[pos % 7])
    }
    this.setState({
      boardArr: newBoardArr
    })


    myEventBus.on('fillEnd', (index) => {
      console.log(9090, index, longestCol);
      if (index % 7 === longestCol) {
        // 需等到最后一个掉落再触发
        myEventBus.off('fillEnd')
        // console.log(myEventBus.fillEnd);
        this.digTriple(posArr.concat(dropedPosArr))
      }
    })
  }

  fillEndHandler(index) {
    console.log(88, index);
    myEventBus.emit('fillEnd', index)
  }

  renderSquare(i, index) {
    return <Square
      {...i}
      index={index}
      on={index === this.state.selectedIndex}
      onClick={() => this.clickHandler(index)}
      onSwitchEnd={() => this.switchEndHandler(index)}
      onDestroyEnd={(e) => this.destroyEndHandler({ e, index })}
      onFillEnd={() => this.fillEndHandler(index)}

      key={i.id}
    />;
  }

  render() {
    return (
      <>
        <h4>state: {this.stateFlag}</h4>
        <div className="container">
          {
            this.state.boardArr.map((item, index) => this.renderSquare(item, index))
          }
        </div>
      </>
    )
  }
}
