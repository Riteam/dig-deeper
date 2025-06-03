import { useState, useEffect, useRef, useMemo } from 'react'
import Grid from './Grid'
import style from './Underground.module.css'
import Utils from "./assets/js/utils"
import { type snapshot } from './App'
import { genGrid, findMatch3, findSquare, type GridData } from './assets/js/GridsMethods'
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
      console.log('等待爆破组合', res)
      doMine(grids, res)
    }

    return res.length > 0
  }

  const doMine = (grids: GridData[], matchedBlocks: number[][]) => {

    console.log('doMine');

    const unique = new Set(matchedBlocks.flat())

    const minedGrids = [...grids]
    for (const pos of matchedBlocks) {
      for (const i of pos) {
        minedGrids[i] = {
          ...minedGrids[i],
          type: -1
        }
      }
      if (pos.length === 4) {
        minedGrids[pos[0]].type = 100
        unique.delete(pos[0])
      }
    }

    const matchedBlocksFlat = [...unique]
    // 保存快照：mined
    saveSnapshot({
      t: 'mined',
      g: minedGrids,
      i: matchedBlocksFlat
    })
    doFill(minedGrids, matchedBlocksFlat)
  }

  const doFill = (grids: GridData[], needFillPos: number[]) => {

    const filledGrids = [...grids]
    console.log('doFill');

    // 把需要补的[列]找出来
    const colsSet = new Set<number>()
    for (const i of needFillPos) {
      colsSet.add(i % size)
    }

    // 遍历每[列]，确定底部坐标，从底部开始往上数
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
        slow -= size
      }
    }


    // 保存快照：filled
    saveSnapshot({
      t: 'filled',
      g: filledGrids,
      i: needFillPos
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