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


const Burst = () => {
  const animDom = useRef(null);
  const moBurst = useRef(null);

  useEffect(() => {
    if (moBurst.current) return;

    // Assign a Shape animation to a ref
    const b = new mojs.Burst({
      parent: animDom.current,
      radius: { 0: 50 },
      count: 9,
      onStart() {
        console.log('start');
      },
      onComplete() {
        console.log('end');
      },
      children: {
        swirlSize: 200,
        shape: 'rect',
        fill: '#707070',
        duration: 1000,
        isShowEnd: true,
        isShowStart: true,
      }
    });

    b.play()

    moBurst.current = b
  }, []);

  return (
    <div className={style.burst} ref={animDom}></div>
  );
};

export default Burst;