import { useState, useEffect } from 'react'
import Grid from "./Grid"
import style from './assets/css/Underground.module.css'


type UndergroundProps = {
  type?: number;
  num: number;
  size: number;
}

function genGrids(size: number) {
  const type = 7

  return Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => {
      return (Math.random() * type) | 0
    })
  })
}


function Underground({ size }: UndergroundProps) {
  const [grids, setGrids] = useState<number[][]>([]);

  useEffect(() => {
    const g = genGrids(size)
    setGrids(g);
    console.log('Generated grids:', g);
  }, []);

  const [selected, setSelected] = useState(0)
  const clickHandler = (num: number): number => {
    console.log(num);
    setSelected(num);
    console.log('Selected:', num);
    return num;
  }

  return <div className={style.Underground}>
    {
      grids.map((rows, i) => (
        <div key={i}>
          {
            rows.map((num, j) => (
              <Grid
                type={num}
                key={j * size + i}
                onGridClick={clickHandler}
              />
            ))
          }
        </div>
      ))
    }
  </div >
}

export default Underground