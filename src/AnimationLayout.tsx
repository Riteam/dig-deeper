import { useEffect, useRef } from "react";
import Config from "./assets/js/config"
import mojs from "@mojs/core";
import Bus from './assets/js/bus'

const { Size, Variety } = Config

let Layout: HTMLDivElement | null = null
const usedBurst = new Map()

function burstOn(x: number, y: number) {
  const name = x + ',' + y
  if (!usedBurst.has(name)) {
    console.log(usedBurst);
    usedBurst.set(name, new mojs.Burst({
      parent: Layout,
      x,
      y,
      radius: { 0: 40 },
      count: 9,
      isShowEnd: false,
      children: {
        shape: 'rect',
        radius: 6,
        fill: [
          '#B4B4B4',
          '#DCDCDC',
          '#FFFFFF',
          '#878787',
        ],
        scale: 1,
        opacity: { 1: 0.5 },
        degreeShift: 'rand(0, 360)',
        rotate: 'rand(0, 360)',
        duration: 400,
        // rotate: { 0: 360 },
      }
    }))
  }
  const burst = usedBurst.get(name)
  burst.replay()
}

export function BoomAt(x: number, y: number) {
  const e = new mojs.Shape({
    shape: 'circle',
    fill: 'none',
    stroke: { 'red': 'deeppink' },
    scale: { 0: 1 },
    strokeWidth: { 100: 0 },
    radius: 200,
    x,
    y,
    duration: 500,
  })

  e.play()
}

for (let i = 0; i < Variety; i++) {
  Bus.on('mined_ore_' + i, ({ x, y, width, height }: DOMRect) => {
    if (Layout) {
      const rect = Layout?.getBoundingClientRect()
      const offsetX = x - rect.x + width / 2
      const offsetY = y - rect.y + height / 2

      burstOn(offsetX | 0, offsetY | 0)
    }
  })
}

Bus.on('Boom', ({ x, y }: DOMRect) => {
  BoomAt(x, y)
})

export default function AnimationLayout() {
  const layoutRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    Layout = layoutRef.current
  }, [])
  return <div id="animation_layout" ref={layoutRef}>
    <div id="burst_layout"></div>
  </div>;
}