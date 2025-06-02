import { useEffect, useRef, useState } from 'react'
import style from './Inventory.module.css'
import mojs from '@mojs/core'
import Bus from './assets/js/bus'
import Config from './assets/js/config'

interface InventoryItemProps {
  count: number,
  type: number
}


function burstOn(el: HTMLElement, x: number, y: number) {
  const b = new mojs.Burst({
    parent: el,
    x: x + 16,
    y: y + 16,
    radius: { 0: 40 },
    count: 6,
    children: {
      shape: 'rect',
      radius: 6,
      fill: [
        '#B4B4B4',
        '#DCDCDC',
        '#FFFFFF',
        '#878787',
      ],
      degreeShift: 'rand(0, 360)',
      duration: 200,
      rotate: { 0: 360 },
    },
    onComplete() {
      b.el.parentElement.removeChild(b.el)
    },
  });
  b.play()
}


function Inventory({ count, type }: InventoryItemProps) {
  const img = Config.Ores[type]
  const imgBox = useRef<HTMLDivElement>(null)
  const forCopy = useRef<HTMLImageElement>(null)

  useEffect(() => {
    console.log('Inventory item type', type);

    Bus.on('mined_ore_' + type, ({ x, y }: { x: number, y: number }) => {
      console.log(x, y);

      if (imgBox.current && forCopy.current) {


        const { left, top } = imgBox.current.getBoundingClientRect()
        const i = forCopy.current.cloneNode() as HTMLImageElement
        i.classList.add(style.flying)
        imgBox.current.appendChild(i)

        const
          offsetX = x - left,
          offsetY = y - top,
          distance = Math.sqrt(offsetX ** 2 + offsetY ** 2)

        const dur = distance * (7 - (distance / 100 | 0)) * 0.3

        burstOn(imgBox.current, offsetX, offsetY)

        const fly = new mojs.Html({
          el: i,
          x: { [offsetX + 16]: 0 },
          y: { [offsetY + 16]: 0 },
          scale: { 1.6: 1 },
          opacity: 1,
          duration: dur,
          delay: 50,
          onComplete: () => {
            imgBox.current?.removeChild(i)
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