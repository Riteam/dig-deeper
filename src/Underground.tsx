import { useState, useEffect, useRef, useMemo } from 'react'
import Grid from './Grid'
import style from './Underground.module.css'
import Utils from "./assets/js/utils"
import { type snapshot } from './App'
import { genGrid, findMatch3, findSquare, destroyGrid, findInChebyshev, type GridData, findRowIndexes, findColIndexes } from './assets/js/GridsMethods'
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
    // const g = [...grids]
    const destroyedIndexes = new Set<number>()

    for (const i of starsIndexes) {
      // destroyGrid(g, i)
      // destroyedIndexes.push(i)

      const crossIndexes = [...findRowIndexes(i, size), ...findColIndexes(i, size)]

      for (const j of crossIndexes) {
        // if (g[j].type === 100) {

        // } else if (g[j].type !== -1) {
        // destroyGrid(g, j)
        destroyedIndexes.add(j)
        // }
      }

    }

    console.log(111111, destroyedIndexes);

    return [...destroyedIndexes]


    // // 保存快照：exploded
    // saveSnapshot({
    //   t: 'mined',
    //   g,
    //   i: destroyedIndexes
    // })

    // doFill(g)
  }
  const doExplode = (grids: GridData[], TNTindexes: number[]) => {
    console.log('doExplode');

    // const g = [...grids]


    const destroyedIndexes = new Set<number>()
    // const withinTNTs = new Set<number>()

    for (const index of TNTindexes) {
      // destroyGrid(g, index)
      // destroyedIndexes.push(index)


      // 检查周围8格
      const indexes = findInChebyshev(grids, index, 1)

      for (const index of indexes) {
        // const { type } = g[index]
        // if (type === 100) {
        //   withinTNTs.push(index)
        // }
        // else if (type !== -1) {
        // destroyGrid(g, index)
        destroyedIndexes.add(index)
      }
    }

    return [...destroyedIndexes]
  }

  // // 保存快照：exploded
  // saveSnapshot({
  //   t: 'mined',
  //   g,
  //   i: destroyedIndexes
  // })

  // if (withinTNTs.length) {
  //   doExplode(g, withinTNTs)
  // }
  // else {
  //   doFill(g)
  // }
  // }


  const doMine = (grids: GridData[], matchedBlocks: number[][]) => {

    console.log('doMine');
    const minedGrids = [...grids]

    const unique = new Set<number>()
    const withinWonders = new Set<number>()
    const addingBlocks = new Set<number>()

    for (const pos of matchedBlocks) {
      for (const i of pos) {
        const { type } = minedGrids[i]
        console.log(9999999, minedGrids[i]);

        destroyGrid(minedGrids, i)
        if (type === 100) {
          doExplode(minedGrids, [i]).forEach(j => addingBlocks.add(j))
        } else if (type === 101) {
          doCross(minedGrids, [i]).forEach(j => addingBlocks.add(j))
        }
        else if (type !== -1) {
          unique.add(i)
        }
      }

      // if (pos.length === 4 && grids[pos[0]].type !== 100) {
      //   const TNT = genGrid(variety)
      //   TNT.type = 100
      //   minedGrids[pos[0]] = TNT
      //   unique.delete(pos[0])
      // }
    }


    console.log(addingBlocks);

    for (const i of addingBlocks) {
      const { type } = minedGrids[i]
      if (type >= 100) {
        withinWonders.add(i)
      }
      else {
        destroyGrid(minedGrids, i)
        unique.add(i)
      }
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

export default Underground