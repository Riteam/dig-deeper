import { useEffect, useRef, useContext, useLayoutEffect, useCallback, use } from 'react'
import { AnimateEndContext } from './App.tsx'
import Config from './assets/js/config'
import style from './Grid.module.css'
import Utils from "./assets/js/utils"
import Bus from "./assets/js/bus"

// imgs
import redstone from './assets/img/redstone.png'
import copper from './assets/img/copper.png'
import gold from './assets/img/gold.png'
import emerald from './assets/img/emerald.png'
import diamond from './assets/img/diamond.png'
import lazuli from "./assets/img/lazuli.png"
import amethyst from "./assets/img/amethyst.png"



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
      easing: 'cubic-bezier(.98,.67,.38,1.23)',
    }
  )
}


const size = Config.Size
function Grid({ type, selected, index, initPos, onGridClick }: GridProps) {

  const
    mine_icon = MineMap[type] || ''
    , node = useRef<HTMLDivElement>(null)
    , prevIndex = useRef(index)
    , droppedRef = useRef(false)
    , oreType = useRef(type)


  const callAnimateEnd = useContext(AnimateEndContext)

  const doDrop = useCallback(() => {
    if (initPos >= 0) {
      animate(node.current, 0, -initPos).finished.then(() => {
        callAnimateEnd(index)
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
        callAnimateEnd(index)
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


  useEffect(() => {
    if (type < 0) {
      if (node.current) {
        const rect = node.current.getBoundingClientRect()
        Bus.emit('mined_ore_' + oreType.current, {
          x: rect.left,
          y: rect.top
        })
      }
      setTimeout(() => {
        callAnimateEnd(index)
      }, 100);
    }
  }, [type])
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
  if (type < 0) {
    gridStyle += ' ' + style.hide
  }

  return (
    <div
      className={gridStyle}
      onClick={() => onGridClick(index)}
      ref={node}
    >
      {index}
      {mine_icon ? <img src={mine_icon} /> : null}
    </div>
  )
}

export default Grid