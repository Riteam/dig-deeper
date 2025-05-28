import { useEffect, useRef, useState } from 'react'
import style from './assets/css/Grid.module.css'
import redstone from './assets/img/redstone.png'
import copper from './assets/img/copper.png'
import gold from './assets/img/gold.png'
import emerald from './assets/img/emerald.png'
import diamond from './assets/img/diamond.png'
import lazuli from "./assets/img/lazuli.png"
import amethyst from "./assets/img/amethyst.png"

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
  onGridClick: (num: number) => number
}

function Grid({ type, onGridClick }: GridProps) {
  const mine_icon = MineMap[type] || redstone
  
  // const [displayNum, setDisplayNum] = useState(num)
  // const prevNumRef = useRef(num)

  // useEffect(() => {
  //   const prevNum = prevNumRef.current
  //   if (Math.abs(num - prevNum) > 20) {
  //     let start = prevNum
  //     const step = (num - prevNum) / 20
  //     let current = 0
  //     const interval = setInterval(() => {
  //       current++
  //       start += step
  //       if (current >= 20) {
  //         setDisplayNum(num)
  //         clearInterval(interval)
  //       } else {
  //         setDisplayNum(Math.round(start))
  //       }
  //     }, 20)
  //   } else {
  //     setDisplayNum(num)
  //   }
  //   prevNumRef.current = num
  // }, [num])

  return (
    <div className={style.grid} onClick={() => onGridClick(type)}>
      <img src={mine_icon} alt="" />
    </div>
  )
}

export default Grid