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

function swap(arr, a, b) {
  let temp = arr[a]
  arr[a] = arr[b]
  arr[b] = temp
}

function findTriple(arr, startPoint) {
  let target = arr[startPoint].type,
    row = [], col = [],
    res = []

  let x = startPoint,
    xMin = (startPoint / 7 | 0) * 7,
    xMax = ((startPoint / 7 | 0) + 1) * 7 - 1
  while ((x - 1) >= xMin && arr[x - 1]?.type === target) {
    x -= 1
  }
  while (x <= xMax && arr[x]?.type === target) {
    row.push(x++)
  }
  if (row.length >= 3) {
    res = res.concat(row)
  }

  let y = startPoint
  while (arr[y - 7]?.type === target) {
    y -= 7
  }
  while (arr[y]?.type === target) {
    col.push(y)
    y += 7
  }
  if (col.length >= 3) {
    res = res.concat(col)
  }

  return [...new Set(res)]
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
      this.fillSquire(emptyArrTotal, posArr)
    }, 0);
  }

  fillSquire(posArr, extraArr) {
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
        this.digTriple(posArr.concat(extraArr))
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
