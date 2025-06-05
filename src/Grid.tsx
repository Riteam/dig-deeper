import { useEffect, useRef, useContext, useLayoutEffect, useCallback } from 'react'
import { AnimateEndContext } from './App.tsx'
import Config from './assets/js/config'
import style from './Grid.module.css'
import Utils from "./assets/js/utils"
import Bus from "./assets/js/bus"
import { BoomAt } from './AnimationLayout.tsx'

const { getXY } = Utils
const { Ores } = Config
const { Wonders } = Config

type GridProps = {
  type: number,
  id: number,
  index: number
  initPos: number,
  selected: boolean,
  onGridClick: (index: number) => void
}


const getIconByType = (type: number) => {
  if (type < 0) return ''
  if (type >= 100) return Wonders[type - 100]
  return Ores[type]
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

function showUp(el: HTMLDivElement | null) {
  if (!el) throw new Error('no el');
  return el.animate(
    [
      { transform: `scale(0)` },
      { transform: 'scale(1)' }
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(.98,.67,.38,1.23)',
    }
  )
}


const size = Config.Size
function Grid({ type, selected, index, initPos, onGridClick }: GridProps) {

  const
    icon = getIconByType(type)
    , node = useRef<HTMLDivElement>(null)
    , prevIndex = useRef(index)
    , droppedRef = useRef(false)
    , oreType = useRef(type)
    , showAnimationPlayed = useRef(false)


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
      [r1, c1] = getXY(index, size)
      , [r2, c2] = getXY(prevIndex.current, size)
      , offsetRows = r2 - r1
      , offsetCols = c2 - c1

    if (offsetRows || offsetCols) {
      // 如果位置变化了，更新位置
      animate(node.current, offsetCols, offsetRows).finished.then(() => {
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
    else {
      doMove()
    }
  }, [index])


  useEffect(() => {
    if (type < 0) {
      if (node.current) {
        const rect = node.current.getBoundingClientRect()
        Bus.emit('mined_ore_' + oreType.current, rect)
        if (oreType.current === 100) {
          BoomAt(rect)
        }
      }
      setTimeout(() => {
        callAnimateEnd(index)
      }, 140);
    }

  }, [type])


  // 特殊道具出现动画
  useLayoutEffect(() => {
    if (type === 100 && !showAnimationPlayed.current) {
      showAnimationPlayed.current = true
      showUp(node.current)
        .finished
        .then(() => {
          console.log('特殊道具出现动画');
          callAnimateEnd(index)
        });
    }
  }, [])

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
      {icon ? <img src={icon} /> : null}
    </div>
  )
}

export default Grid