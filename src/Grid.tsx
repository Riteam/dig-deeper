import { useEffect, useRef, useContext, useLayoutEffect, useCallback } from 'react'
import { SizeContext } from './App.tsx'
import style from './Grid.module.css'
import mojs from '@mojs/core'

// imgs
import redstone from './assets/img/redstone.png'
import copper from './assets/img/copper.png'
import gold from './assets/img/gold.png'
import emerald from './assets/img/emerald.png'
import diamond from './assets/img/diamond.png'
import lazuli from "./assets/img/lazuli.png"
import amethyst from "./assets/img/amethyst.png"

import Utils from "./assets/js/utils"
const { getXY } = Utils

const MineMap = [
  redstone,
  copper,
  gold,
  emerald,
  diamond,
  lazuli,
  amethyst
]

type GridProps = {
  type: number,
  id: number,
  index: number
  initPos: number,
  selected: boolean,
  onGridClick: (index: number) => void
  onAnimateEnd: (id: number) => void
}

function Grid({ id, type, selected, index, initPos, onGridClick, onAnimateEnd }: GridProps) {

  const
    mine_icon = MineMap[type]
    , size = useContext(SizeContext)
    , node = useRef<HTMLDivElement>(null)
    , prevIndex = useRef(index)
    , droppedRef = useRef(false)

  const doDrop = useCallback(() => {
    if (initPos < 0) return
    console.log(99999, id, index);

    node.current?.animate(
      [
        { transform: `translate(0px, -${initPos * 64}px)` },
        { transform: 'translate(0)' }
      ],
      {
        duration: Math.abs(initPos) * 160,
        easing: 'ease-in',
      }
    ).finished.then(() => {
      onAnimateEnd(index)
    });
  }, [initPos])

  const doMove = () => {
    const
      [x, y] = getXY(index, size)
      , [prevX, prevY] = getXY(prevIndex.current, size)
      , offsetX = prevX - x
      , offsetY = prevY - y

    if (offsetX || offsetY) {
      // 如果位置变化了，更新位置
      node.current?.animate(
        [
          { transform: `translate(${offsetY * 64}px, ${offsetX * 64}px)` },
          { transform: 'translate(0)' }
        ],
        {
          duration: Math.max(Math.abs(offsetX), Math.abs(offsetY)) * 160,
          easing: 'ease-in',
        }
      ).finished.then(() => {
        onAnimateEnd(index)
      });
    }

    prevIndex.current = index // 保存新位置
  }
  useLayoutEffect(() => {
    if (droppedRef.current === false) {
      doDrop()
      droppedRef.current = true
      return
    }

    else
      doMove()
  }, [index])

  // useLayoutEffect(() => {
  //   if (droppedRef.current === false) {
  //     doDrop()
  //     droppedRef.current = true
  //   }
  // }, [])

  // 基本样式
  let gridStyle = style.grid
  // 添加被框选样式
  if (selected) {
    gridStyle += ' ' + style.selected
  }

  return (
    <div
      className={gridStyle}
      onClick={() => onGridClick(index)}
      ref={node}
    >
      {index}
      <img src={mine_icon} alt="" />
    </div>
  )
}

export default Grid