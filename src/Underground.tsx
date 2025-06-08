import { useState, useEffect, useRef, useMemo } from 'react'
import Grid from './Grid'
import style from './Underground.module.css'
import Utils from "./assets/js/utils"
import { type snapshot } from './App'
import { genGrid, findMatch3, findSquare, destroyGrid, findInChebyshev, type GridData, findRowIndexes, findColIndexes, isAllSameType } from './assets/js/GridsMethods'
import Config from "./assets/js/config"


type UndergroundProps = {
  grids: GridData[];
  saveSnapshot: (snapshot: snapshot) => void;
  selectable: boolean
}

const size = Config.Size
const variety = Config.Variety

// 地下矿床组件
function Underground({ grids, selectable, saveSnapshot }: UndergroundProps) {
  const [selected, setSelected] = useState(-1)

  useEffect(() => {
    if (selectable === false)
      setSelected(-1)
  }, [selectable])

  const doSwap = (selected: number, index: number) => {
    console.log('doSwap');

    /**
     * 核心思路：
     * 每次棋盘变化记录 grids 为 snapshot
     * 按顺序存入数组
     * 直到不能再消除后，从头取出播放即可
     */

    const swappedGrids = [...grids] // 拷贝
    Utils.swap(swappedGrids, index, selected);
    // 保存快照：swap
    saveSnapshot({
      t: 'swap',
      g: swappedGrids,
      i: [selected, index]
    })

    // 处理TNT爆炸&十字连
    for (const i of [index, selected]) {
      if (swappedGrids[i].type >= 100) {
        doMine(swappedGrids, [[i]])
        return
      }
    }

    if (doExplore(swappedGrids, [selected, index]) === false) {

      // 保存快照：undo swap
      saveSnapshot({
        t: 'undo',
        g: grids,
        i: [selected, index]
      })
    }

  }

  // 检查有无三连
  const doExplore = (grids: GridData[], startPos: number[]): boolean => {

    const res = []

    // 去重
    const visited = new Set<number>()

    for (const i of startPos) {
      if (visited.has(i)) continue
      visited.add(i)

      const iMatched3 = findMatch3(grids, i)
      const iMatched4 = findSquare(grids, i)

      // 横竖3连优先
      if (iMatched3.length && iMatched3.length >= iMatched4.length) {
        res.push(iMatched3)
        iMatched3.forEach(j => visited.add(j))
      }
      // 田字形次之
      else if (iMatched4.length) {
        res.push(iMatched4)
        iMatched4.forEach(j => visited.add(j))
      }
    }

    console.log('doExplore startPos', startPos)
    console.log('doExplore visited', visited)
    console.log('doExplore Result', res)

    if (res.length) {
      console.log('等待开采组合', res)
      doMine(grids, res)
    }

    return res.length > 0
  }


  const doCross = (grids: GridData[], starsIndexes: number[]) => {
    const destroyedIndexes = new Set<number>()

    for (const i of starsIndexes) {

      const crossIndexes = [...findRowIndexes(i, size), ...findColIndexes(i, size)]

      for (const j of crossIndexes) {
        destroyedIndexes.add(j)
      }

    }

    return [...destroyedIndexes]
  }
  const doExplode = (grids: GridData[], TNTindexes: number[]) => {
    console.log('doExplode');

    const destroyedIndexes = new Set<number>()

    for (const index of TNTindexes) {

      // 检查周围8格
      const indexes = findInChebyshev(grids, index, 1)

      for (const index of indexes) {
        destroyedIndexes.add(index)
      }
    }

    return [...destroyedIndexes]
  }


  const doMine = (grids: GridData[], matchedGroups: number[][]) => {
    console.log('doMine');
    const minedGrids = [...grids]

    const unique = new Set<number>()
    const withinWonders = new Set<number>()
    const moreToDestroy = new Set<number>()
    const addingWonders: [number, GridData['type']][] = []

    for (const group of matchedGroups) {
      // 检查是否所有方块类型相同
      console.log(Utils.isSquareShape);
      const allSameType = isAllSameType(minedGrids, group)

      // 检测特殊形状，在破坏后添加神奇道具
      if (allSameType) {
        if (group.length === 4) {
          // 判断是否为2x2方块
          const isSquare = Utils.isSquareShape(group, size)

          if (isSquare) {
            // 执行A: 2x2方块生成TNT
            // const TNT = genGrid(variety)
            addingWonders.push([group[0], 100])
            // TNT.type = 100 // TNT类型
            // minedGrids[group[0]] = TNT
            // unique.delete(group[0])
            // console.log('生成TNT')
          } else {
            // 执行B: 4格直线
          }
        }
        else if (group.length > 4) {
          // 判断形状
          const shape = getShapeType(group, size)
          console.log(99999999, shape);

          switch (shape) {
            case 'line':
            // 执行C: 直线消除整行/列
            // const linePoints = Utils.findLongestLine(group.map(p => Utils.getXY(p, size)), true)
            // const isHorizontal = linePoints[0][1] === linePoints[1][1]
            // const lineIndex = isHorizontal ? linePoints[0][1] : linePoints[0][0]

            // // 消除整行或整列
            // for (let i = 0; i < size; i++) {
            //   const index = isHorizontal ?
            //     Utils.toIndex(size, lineIndex, i) :
            //     Utils.toIndex(size, i, lineIndex)
            //   if (minedGrids[index].type !== -1) {
            //     destroyGrid(minedGrids, index)
            //     unique.add(index)
            //   }
            // }
            // console.log('消除整行/列')
            // break

            case 'L':
            case 'T':
            case 'cross':
              // 直线生成十字炸弹
              addingWonders.push([group[0], 101])
              // const crossBomb = genGrid(variety)
              // crossBomb.type = 101 // 十字炸弹类型
              // minedGrids[group[0]] = crossBomb
              // unique.delete(group[0])
              // console.log('生成十字炸弹')
              break
          }
        }

        group.forEach(index => {
          if (minedGrids[index].type <= variety) {
            destroyGrid(minedGrids, index)
            unique.add(index)
          }
        })
      }

      for (const i of group) {
        const { type } = minedGrids[i]
        destroyGrid(minedGrids, i)

        if (type === 100) {
          doExplode(minedGrids, [i]).forEach(j => moreToDestroy.add(j))
        } else if (type === 101) {
          doCross(minedGrids, [i]).forEach(j => moreToDestroy.add(j))
        }
        else if (type !== -1) {
          unique.add(i)
        }
      }

    }


    for (const i of moreToDestroy) {
      const { type } = minedGrids[i]
      if (type >= 100) {
        withinWonders.add(i)
      }
      else if (type !== -1) {
        destroyGrid(minedGrids, i)
        unique.add(i)
      }
    }


    // 替换部分方块为TNT或下界之星
    for (let [index, type] of addingWonders) {
      const grid = genGrid(variety)
      grid.type = type
      minedGrids[index] = grid
      unique.delete(index)
    }

    const matchedBlocksFlat = [...unique]
    // 保存快照：mined
    saveSnapshot({
      t: 'mined',
      g: minedGrids,
      i: matchedBlocksFlat
    })

    if (withinWonders.size) {
      doMine(minedGrids, [[...withinWonders]])
    } else {
      doFill(minedGrids)
    }
  }

  const doFill = (grids: GridData[]) => {

    const filledGrids = [...grids]
    console.log('doFill');

    // 把需要补的[列]找出来
    // const colsSet = new Set<number>()
    // for (const i of needFillPos) {
    //   colsSet.add(i % size)
    // }

    // 遍历每[列]，确定底部坐标，从底部开始往上数
    const colsSet = Utils.range(1, 8)
    const changedIndex: number[] = []

    for (const i of colsSet) {
      const bottom = size * (size - 1) + i

      // 快慢指针原地交换下掉方块
      let slow = bottom, fast = bottom
      while (fast >= 0) {
        if (filledGrids[fast].type !== -1) {
          filledGrids[slow] = filledGrids[fast]
          slow -= size
        }
        fast -= size
      }

      // 最后顶部空缺替换成新方块
      const dropHeight = (slow - fast) / size | 0

      while (slow >= 0) {
        // 新补充的方块需要在下一步检查三连
        filledGrids[slow] = genGrid(variety, dropHeight)
        changedIndex.push(slow)
        slow -= size
      }
    }

    // 保存快照：filled
    saveSnapshot({
      t: 'filled',
      g: filledGrids,
      i: changedIndex
    })
    doExplore(filledGrids, Utils.range(3, filledGrids.length))
  }

  // 接收点击事件参数
  const clickHandler = (index: number) => {
    console.log('Selected:', grids[index]);
    // 播放中不可选
    if (!selectable) return

    // 已选
    if (selected >= 0) {
      // 选了同一个，取消选择
      if (index === selected) {
        setSelected(-1);
      }
      // 选了邻接的，交换
      else if (Utils.isAdjacent(selected, index, size)) {
        doSwap(selected, index);
        setSelected(-1);
      }
      // 选了不相邻的，重新选择
      else
        setSelected(index);
    }
    // 未选
    else setSelected(index);
  }


  return <div className={style.Underground}>
    {
      grids.map((data, idx) => {
        return (
          <Grid
            key={data.id}
            {...data}
            index={idx}
            selected={idx === selected}
            onGridClick={clickHandler}
          />)
      })
    }
  </div >
}


// 辅助函数：判断形状类型
function getShapeType(pos: number[], size: number): 'line' | 'L' | 'T' | 'cross' {
  // 获取所有点的坐标
  const points = pos.map(p => Utils.getXY(p, size))

  // 检查是否为直线
  const isLine = Utils.checkIsLine(points)
  if (isLine) return 'line'

  // 检查是否为L形
  const isL = Utils.checkIsL(points)
  if (isL) return 'L'

  // 检查是否为T形
  const isT = Utils.checkIsT(points)
  if (isT) return 'T'

  // 检查是否为十字形
  const isCross = Utils.checkIsCross(points)
  if (isCross) return 'cross'

  return 'line' // 默认返回直线
}

export default Underground