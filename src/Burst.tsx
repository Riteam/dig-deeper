import { useRef, useEffect, useContext, useCallback } from "react";
import { AnimateEndContext } from './App.tsx'
import style from "./Burst.module.css";
/**
 * Usage:
 * import MojsExample from './MojsExample';
 *
 * <MojsExample duration={1000}/>
 */

type BurstProps = {
  index: number;
};

const Burst = ({ index }: BurstProps) => {
  const animDom = useRef(null);
  const moBurst = useRef(null);
  const callAnimateEnd = useContext(AnimateEndContext)

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
        callAnimateEnd(index)
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