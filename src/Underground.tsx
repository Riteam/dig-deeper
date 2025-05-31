import { useState, useEffect, useRef, useMemo } from 'react'
import Grid from "./Grid"
import Burst from './Burst'
import style from './Underground.module.css'
import Utils from "./assets/js/utils"


type UndergroundProps = {
  type?: number;
  variety: number;
  size: number;
}

interface GridData {
  id: number
  type: number
  initPos: number
}

function findMatch3(
  grids: GridData[],
  startIndex: number
) {
  const size = grids.length ** 0.5
  const { type } = grids[startIndex]
  const [row] = Utils.getXY(startIndex, size);

  // 边界
  const
    left = row * size
    , right = (row + 1) * size - 1
    , bottom = size * size - 1
    , res: number[] = []

  // 检查水平方向（左和右）
  const leftPoints = [];
  let j = startIndex - 1;
  while (j >= left && grids[j].type === type) {
    leftPoints.push(j);
    j--;
  }

  const rightPoints = [];
  j = startIndex + 1;
  while (j <= right && grids[j].type === type) {
    rightPoints.push(j);
    j++;
  }

  if (leftPoints.length + rightPoints.length + 1 >= 3) {
    res.push(...leftPoints, ...rightPoints);
  }

  // 检查垂直方向（上和下）
  const upPoints = [];
  j = startIndex - size;
  while (j >= 0 && grids[j].type === type) {
    upPoints.push(j);
    j -= size;
  }

  const downPoints = [];
  j = startIndex + size;
  while (j <= bottom && grids[j].type === type) {
    downPoints.push(j);
    j += size;
  }

  if (upPoints.length + downPoints.length + 1 >= 3) {
    res.push(...upPoints, ...downPoints);
  }

  if (res.length) res.push(startIndex)

  return [...new Set(res)]
}

function findSquare(grids: GridData[], startIndex: number) {
  const size = grids.length ** .5

  const { type } = grids[startIndex]

  function getFour(idx: number): number[] {
    return [idx, idx + 1, idx + size, idx + size + 1]
  }
  for (const i of getFour(startIndex - size - 1)) {
    if (i >= 0) {
      const currFour = getFour(i)
      if (currFour.every(j => grids[j]?.type === type)) {
        return currFour
      }
    }
  }

  return []
}

// 生成一个随机矿单位
function genGrid(variety: number, initPos: number = -1): GridData {
  return {
    id: Utils.getUniqueId(),
    type: Math.floor(Math.random() * variety),
    initPos
  }
}

// 生成矿床矩阵
function genGrids(size: number, variety: number): GridData[] {
  return Array.from({ length: size ** 2 }, () => {
    return genGrid(variety)
  })
}




// 地下矿床组件
function Underground({ size, variety }: UndergroundProps) {

  const [grids, setGrids] = useState<GridData[]>([]);
  const [selected, setSelected] = useState(-1)

  const WaitingAnimateEnd = useRef(new Set<number>())
  const SnapshotsRef = useRef<GridData[][]>([])

  useEffect(() => {
    const g = genGrids(size, variety)
    setGrids(g);
    console.log('Generated grids:', g);
  }, []);


  const doSwap = (selected: number, index: number) => {

    console.log('doSwap');

    // 核心思路：把后续一系列变化结果计算成grids的snapshot，然后一个个播放即可

    const swappedGrids = [...grids] // 拷贝
    Utils.swap(swappedGrids, index, selected);
    // 保存快照：swap
    SnapshotsRef.current.push(swappedGrids)

    if (doExplore(swappedGrids, [selected, index]) === false) {

      // 保存快照：undo swap
      SnapshotsRef.current.push(grids)
    }

    Promise.resolve().then(() => {
      playSnapshots()
    })
  }

  // 看没有没有能消除的
  const doExplore = (grids: GridData[], startPos: number[]): boolean => {

    const res = []

    for (const i of startPos) {
      const iMatched3 = findMatch3(grids, i)
      const iMatched4 = findSquare(grids, i)

      // 横竖3连优先
      if (iMatched3.length) res.push(iMatched3)
      // 田字形次之
      else if (iMatched4.length) res.push(iMatched4)
    }

    console.log('doExplore Result', res);

    if (res.length) {
      doMine(grids, res)
    }

    return res.length > 0
  }

  const doMine = (grids: GridData[], matchedBlocks: number[][]) => {

    console.log('doMine');

    const minedGrids = [...grids]
    for (const pos of matchedBlocks) {
      for (const i of pos) {
        minedGrids[i] = {
          ...minedGrids[i],
          type: -1
        }
      }
    }

    // 保存快照：mined
    SnapshotsRef.current.push(minedGrids)
    doFill(minedGrids, matchedBlocks.flat())
  }

  const doFill = (grids: GridData[], matchedPos: number[]) => {

    const filledGrids = [...grids]
    console.log('doFill');
    console.log(matchedPos);


    // 把需要补的[列]找出来
    const colsSet = new Set<number>()
    for (const i of matchedPos) {
      colsSet.add(i % size)
    }
    console.log(colsSet);


    // 遍历每[列]，确定底部坐标，从底部开始往上数
    for (const i of colsSet) {
      const bottom = size * (size - 1) + i
      console.log(bottom);

      let slow = bottom, fast = bottom
      while (fast >= 0) {
        if (filledGrids[fast].type !== -1) {
          filledGrids[slow] = filledGrids[fast]
          slow -= size
        }
        fast -= size
      }


      const dropHeight = (slow - fast) / size | 0
      while (slow >= 0) {
        filledGrids[slow] = genGrid(variety, dropHeight)
        slow -= size
      }
    }

    // 保存快照：filled
    SnapshotsRef.current.push(filledGrids)
    doExplore(filledGrids, matchedPos)
  }

  const playSnapshots = () => {
    const nextGrids = SnapshotsRef.current.shift()
    if (nextGrids) {
      setGrids(nextGrids)
      setTimeout(() => {
        playSnapshots()
      }, 500);
    }
  }
  // 接收点击事件参数
  const clickHandler = (index: number) => {
    console.log('Selected:', grids[index]);
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

  // 动画结束事件
  const animateEndHandler = (id: GridData['id']) => {
    console.log(id);

  }

  return <div className={style.Underground}>
    {
      grids.map((data, idx) => {
        if (data.type >= 0)
          return (
            <Grid
              key={data.id}
              {...data}
              index={idx}
              selected={idx === selected}
              onGridClick={clickHandler}
              onAnimateEnd={animateEndHandler}
            />)
        else
          return <Burst key={idx}></Burst>
      })
    }
  </div >
}
export default Underground