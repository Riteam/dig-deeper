import { useEffect, useRef, useContext, useLayoutEffect, useCallback } from 'react'
import { SizeContext } from './App.tsx'
import style from './Grid.module.css'

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

const animate = (el: HTMLDivElement | null, offsetX: number, offsetY: number) => {
  if (!el) throw new Error('no el');
  const offset = Math.max(Math.abs(offsetX), Math.abs(offsetY))
  return el.animate(
    [
      { transform: `translate(${offsetX * 64}px, ${offsetY * 64}px)` },
      { transform: 'translate(0)' }
    ],
    {
      duration: Math.min(200 + (offset - 1) * 100, 500),
      // easing: 'ease-out',
      // easing: 'cubic-bezier(.45,.14,.47,1.37)',
      easing: 'cubic-bezier(.98,.67,.38,1.23)',
    }
  )
}

function Grid({ type, selected, index, initPos, onGridClick, onAnimateEnd }: GridProps) {

  const
    mine_icon = MineMap[type]
    , size = useContext(SizeContext)
    , node = useRef<HTMLDivElement>(null)
    , prevIndex = useRef(index)
    , droppedRef = useRef(false)

  const doDrop = useCallback(() => {
    if (initPos >= 0) {
      animate(node.current, 0, -initPos).finished.then(() => {
        onAnimateEnd(index)
      });
    }
  }, [initPos])

  const doMove = () => {
    const
      [x, y] = getXY(index, size)
      , [prevX, prevY] = getXY(prevIndex.current, size)
      , offsetX = prevX - x
      , offsetY = prevY - y

    if (offsetX || offsetY) {
      // 如果位置变化了，更新位置
      animate(node.current, offsetY, offsetX).finished.then(() => {
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