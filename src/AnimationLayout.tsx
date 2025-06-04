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
      radius: { 0: 34 },
      count: 9,
      isShowEnd: false,
      children: {
        shape: 'rect',
        radius: 4,
        fill: [
          '#B4B4B4',
          '#DCDCDC',
          '#FFFFFF',
          '#878787',
        ],
        scale: { 1: 0.8 },
        opacity: { 1: 0.5 },
        degreeShift: 'rand(0, 180)',
        rotate: 'rand(0, 360)',
        duration: 300,
        // rotate: { 0: 360 },
      }
    }))
  }
  const burst = usedBurst.get(name)
  burst.replay()
}

export function BoomAt(rect: DOMRect) {
  const { x, y, width, height } = rect
  if (!Layout) return
  const iRect = Layout?.getBoundingClientRect()
  const offsetX = x - iRect.x + width / 2
  const offsetY = y - iRect.y + height / 2

  const e = new mojs.Shape({
    parent: Layout,
    x: offsetX,
    y: offsetY,
    shape: 'circle',
    fill: '#ddd',
    // radius: { 0: 80 },
    duration: 100,
    // fill: 'none',
    stroke: { '#ddd': 'gray' },
    scale: { 0: 1 },
    radius: { 80: 100 },
    strokeWidth: { 100: 0 },
    duration: 300,
    easing: mojs.easing.cubic.out,
    isShowEnd: false,
    onComplete: () => {
      console.log(123);
    }
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