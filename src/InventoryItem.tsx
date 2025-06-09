import { useEffect, useRef } from 'react'
import style from './Inventory.module.css'
import mojs from '@mojs/core'
import Bus from './assets/js/bus'
import Config from './assets/js/config'

interface InventoryItemProps {
  count: number,
  type: number
}





function Inventory({ count, type }: InventoryItemProps) {
  const img = Config.Ores[type]
  const imgBox = useRef<HTMLDivElement>(null)
  const forCopy = useRef<HTMLImageElement>(null)

  useEffect(() => {

    // 跳动动画
    const arrived = new mojs.Html({
      el: forCopy.current,
      scale: 1,
      duration: 0
    }).then({
      scale: { 1.6: 1 },
      duration: 200
    })

    // 矿石飞行动画
    Bus.on('mined_ore_' + type, ({ left: x, top: y }: DOMRect) => {

      console.log(123);

      if (imgBox.current && forCopy.current) {


        const { left, top } = imgBox.current.getBoundingClientRect()
        const i = forCopy.current.cloneNode() as HTMLImageElement
        i.classList.add(style.flying)
        imgBox.current.appendChild(i)

        const
          offsetX = x - left,
          offsetY = y - top,
          distance = Math.sqrt(offsetX ** 2 + offsetY ** 2)


        const fly = new mojs.Html({
          el: i,
          x: { [offsetX + 16]: 0 },
          y: { [offsetY + 16]: 0 },
          scale: 1,
          opacity: { 0.8: 0.5 },
          duration: 100 + distance * 0.5,
          delay: 60,
          onComplete: () => {
            imgBox.current?.removeChild(i)
            arrived.replay()
          },
          easing: mojs.easing.ease.in
        })
        fly.play()
      }
    })
  }, [])


  return (
    <div className={style.item}>
      <div className={style.imgBox} ref={imgBox}>
        <img src={img} ref={forCopy} />
      </div>
      <div className={style.count}>{count}</div>
    </div>
  )
}


export default Inventory