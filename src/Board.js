import { random } from 'lodash';

import React from 'react';
import Square from './Square'
import myEventBus from './assets/js/bus.js'

let idCounter = 0

const BoardLen = 8,
  BoardSize = BoardLen ** 2

function getNewBoard() {
  return new Array(BoardSize).fill(1).map(i => {
    return getNewItem()
  })
}

function getNewItem(dropHeight = 0, to) {
  return {
    type: random(1, 7),
    id: ++idCounter,
    dropHeight,
    tripled: false,
    to
  }
}

// get Manhattan Distance
function getManDis(p1, p2) {
  let [x1, y1] = [p1 % BoardLen, p1 / BoardLen | 0]
  let [x2, y2] = [p2 % BoardLen, p2 / BoardLen | 0]

  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

// 下标转坐标
function index2Coord(index) {
  return [index % BoardLen, index / BoardLen | 0]
}

// 获得形状的交点
function getShapeCenter(arr) {
  for (let i of arr) {
    let x1 = i % BoardLen, y1 = i / BoardLen | 0, ji = 0
    for (; ji < arr.length; ji++) {
      let j = arr[ji]
      if (i === j) continue
      let x2 = j % BoardLen, y2 = j / BoardLen | 0
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
      xMin = (pos / BoardLen | 0) * BoardLen,
      xMax = xMin + BoardLen - 1
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
    while (arr[y - BoardLen]?.type === target) {
      y -= BoardLen
    }
    while (arr[y]?.type === target) {
      col.push(y)
      y += BoardLen
    }
    return col
  }

  let firstXArr = findAtX(startPoint),
    firstYArr = findAtY(startPoint)

  if (firstXArr.length >= 3) {
    res = res.concat(firstXArr)
    firstXArr.forEach(xi => {
      let YArr = findAtY(xi)
      if (YArr.length >= 3) res = res.concat(YArr)
    })
  } else if (firstYArr.length >= 3) {
    res = res.concat(firstYArr)
    firstYArr.forEach(yi => {
      let XArr = findAtX(yi)
      if (XArr.length >= 3) res = res.concat(XArr)
    })
  }
  return res
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

  componentDidMount() {
    console.log('board mount!!');
    setTimeout(() => {
      this.digTriple()
    }, 500);
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
      // if (distance === BoardLen || distance === 1) {
      if (true) {
        // 是上下左右的相邻格子，可以交换
        let newBoardArr = [...this.state.boardArr]
        swap(newBoardArr, sIndex, index)



        this.setState({
          boardArr: newBoardArr,
          selectedIndex: null
        });

        myEventBus.once('switchEnd', () => {
          let DBpos = [index, sIndex].find(i => newBoardArr[i].type === 8)
          if (DBpos >= 0) {
            this.dragonBreathBurst(DBpos, newBoardArr[index + sIndex - DBpos].type)
          } else {
            this.digTriple([index, sIndex], true)
          }
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
    myEventBus.emit('switchEnd', index)
    // if (this.stateFlag === 1) {
    //   this.digTriple(this.stateData)
    // }
  }

  // 龙息瓶爆炸！！
  dragonBreathBurst(selfPos, targetType) {
    let needDestroyPosArr = [selfPos]
    let newBoardArr = this.state.boardArr.map((item, index) => {
      if (item.type === targetType) {
        item.tripled = true
        needDestroyPosArr.push(index)
      }
      return item
    })
    newBoardArr[selfPos].tripled = true
    this.setState({
      boardArr: newBoardArr,
      selectedIndex: null
    });
    myEventBus.once('destroyEnd', () => {
      this.dropDown(needDestroyPosArr)
    })
  }

  // 检查地图是否有效
  checkGameAvailable() {
    console.log('%c* checkGameAvailable', 'color: red;');
    let { boardArr } = this.state
    for (let i = 0; i < boardArr.length; i++) {
      let target = boardArr[i].type
      if (target === 8) return true
      /*
      情况1
        ■    ■
      ■   ■■  ■
        ■    ■
      */
      if (
        i % BoardLen !== BoardLen - 1        //不在最后一列
        && boardArr[i + 1]?.type === target   //右侧相等
      ) {
        let pos = []
        if (i % BoardLen > 0) {
          pos.push(
            i - BoardLen - 1,  //左上
            i + BoardLen - 1   //左下
          )
        }
        if (i % BoardLen < BoardLen - 2) {
          pos.push(
            i - BoardLen + 1,  //右上
            i + BoardLen + 2   //右下
          )
        }
        if (i % BoardLen > 1) {
          pos.push(
            i - 2               //左2
          )
        }
        if (i % BoardLen < BoardLen - 3) {
          pos.push(
            i + 3,              //右3
          )
        }

        if (
          pos.some(p => p >= 0 && boardArr[p]?.type === target)
        )
          return true
      }
      /*
      情况2
        ■
      ■  ■
        ■
        ■
      ■  ■
        ■
      */
      else if (
        i < BoardLen * (BoardLen - 1)                //不在最后一行
        && boardArr?.[i + BoardLen].type === target   //下侧相等
      ) {
        let pos = []
        if (i % BoardLen > 0) {
          pos.push(
            i - BoardLen - 1,      //左上
            i + BoardLen * 2 - 1   //左下
          )
        }
        if (i % BoardLen < BoardLen - 1) {
          pos.push(
            i - BoardLen + 1,      //右上
            i + BoardLen * 2 + 1   //右下
          )
        }
        pos.push(
          i - BoardLen * 2,        //上2
          i + BoardLen * 3         //下3
        )

        if (
          pos.some(p => p >= 0 && boardArr[p]?.type === target)
        )
          return true
      }
      /*
      情况3
      ■  ■
        ■
      ■  ■
      */
      else {
        let pos = [
          i - BoardLen - 1, //左上
          i - BoardLen + 1, //右上
          i + BoardLen + 1, //右下
          i + BoardLen - 1, //左下
        ]
        for (let j = 0; j < pos.length; j++) {
          let curr = pos[j], next = pos[(j + 1) % 4]
          if (
            boardArr[curr]?.type === target
            && boardArr[next]?.type === target
          )
            return true
        }
      }
    }
    return false
  }


  // 寻找并消灭三连！
  digTriple(posArr, isSwitch) {
    console.log('%c* digTriple', 'color: red;');
    this.stateFlag = 2
    if (!posArr) {
      // 不传表示全盘检查，仅需每3个格子检查一次
      posArr = []
      for (let i = 0; i <= BoardSize - 1; i += 3) {
        posArr.push(i)
      }
    }
    console.log('posArr.length', posArr.length);

    let needDestroyShape = new Map(),
      posTripled = new Set()

    posArr.forEach(i => {
      if (posTripled.has(i)) {
        return false
      }
      let pos = findTriple(this.state.boardArr, i)
      // console.log(pos);
      if (pos.length >= 3) {
        console.log('destroyed', pos);
        let core = pos[0], posSet = new Set()
        for (let i of pos) {
          if (posSet.has(i)) core = i
          else posSet.add(i)
        }
        // needDestroyShape = needDestroyShape.concat([...posSet])
        needDestroyShape.set(core, posSet)
        posTripled.add(i)
        posSet.forEach(i => posTripled.add(i))
      }
    })

    if (needDestroyShape.size === 0) {
      this.stateFlag = 0
      console.log('无三连');
      if (isSwitch) {
        // let newBoardArr = [...this.state.boardArr]
        // swap(newBoardArr, posArr[0], posArr[1])
        // setTimeout(() => {
        //   this.setState({
        //     boardArr: newBoardArr,
        //     selectedIndex: null
        //   });
        // }, 75);
      } else {
        let able = this.checkGameAvailable()
        if (!able) console.warn('棋盘无效！')
      }
      return false
    }

    let newBoardArr = [...this.state.boardArr],
      needDestroyPosArr = []

    for (let [core, posSet] of needDestroyShape) {
      console.log(posSet);
      if (posSet.size <= 4) {
        // 正常消除
        posSet.forEach(i => newBoardArr[i].tripled = true)

        needDestroyPosArr.push(...posSet)
      } else {
        // 飞向核心并生成龙息瓶
        posSet.delete(core)
        newBoardArr[core].type = 8

        posSet.forEach(i => newBoardArr[i].to = core)
        needDestroyPosArr.push(...posSet)
      }
    }
    // needDestroyShape.forEach(j => newBoardArr[j].tripled = true)
    this.setState({
      boardArr: newBoardArr,
      selectedIndex: null
    });
    myEventBus.once('destroyEnd', () => {
      this.dropDown(needDestroyPosArr)
    })
  }

  destroyEndHandler(index) {
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
      endPos.add(56 + pos % BoardLen)
    }
    // 得到底部坐标
    endPos = [...endPos]
    // 自底部向上遍历
    for (let epos of endPos) {
      let emptyArr = []
      while (epos >= 0) {
        if (newBoardArr[epos].tripled || newBoardArr[epos].to >= 0) {
          emptyArr.push(epos)
          epos -= BoardLen
        }
        else if (emptyArr.length > 0) {
          let pos = emptyArr.shift()
          swap(newBoardArr, pos, epos)
        } else {
          epos -= BoardLen
        }
      }
      emptyArrTotal = emptyArrTotal.concat(emptyArr)
    }
    console.log(endPos);
    this.setState({
      boardArr: newBoardArr
    })

    setTimeout(() => {
      this.fillSquire(emptyArrTotal)
    }, 0);
  }

  fillSquire(posArr) {
    console.log('%c* fillSquire', 'color: red;', posArr);

    let dropCountPerCol = {},
      longestCol = 0,
      longestColCount = 0
    for (let pos of posArr) {
      let col = pos % BoardLen
      if (col in dropCountPerCol) dropCountPerCol[col]++
      else dropCountPerCol[col] = 1
      if (dropCountPerCol[col] > longestColCount) {
        longestCol = col
        longestColCount = dropCountPerCol[col]
      }
    }
    let newBoardArr = [...this.state.boardArr]
    for (let pos of posArr) {
      newBoardArr[pos] = getNewItem(dropCountPerCol[pos % BoardLen])
    }
    this.setState({
      boardArr: newBoardArr
    })


    myEventBus.on('fillEnd', (index) => {
      if (index % BoardLen === longestCol) {
        // 需等到最后一个掉落再触发
        myEventBus.off('fillEnd')
        // console.log(myEventBus.fillEnd);
        // 全部检查
        this.digTriple()
      }
    })
  }

  fillEndHandler(index) {
    myEventBus.emit('fillEnd', index)
  }

  renderSquare(i, index) {
    return <Square
      {...i}
      index={index}
      size={BoardLen}
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
