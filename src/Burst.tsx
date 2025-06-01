import { useRef, useEffect, useState, useCallback } from "react";
import mojs from "@mojs/core";
import style from "./Burst.module.css";
/**
 * Usage:
 * import MojsExample from './MojsExample';
 *
 * <MojsExample duration={1000}/>
 */

const moBurstConfig = {
  radius: { 0: 100 }
}

type BurstProps = {
  index: number;
  onAnimateEnd: (i: number) => void;
};

const Burst = ({ index, onAnimateEnd }: BurstProps) => {
  const animDom = useRef(null);
  const moBurst = useRef(null);

  useEffect(() => {
    if (moBurst.current) return;

    // Assign a Shape animation to a ref
    const b = new mojs.Burst({
      parent: animDom.current,
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
      // 事件
      onStart() {
        console.log('start');
      },
      onComplete() {
        onAnimateEnd(index)
      },
    });

    b.play()

    moBurst.current = b
  }, []);

  return (
    <div className={style.burst} ref={animDom}></div>
  );
};

export default Burst;