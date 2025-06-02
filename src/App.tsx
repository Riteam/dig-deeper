import { createContext, memo, useRef, useState } from 'react'
import './App.css'
import Underground from './Underground';
import Inventory from './Inventory';
import Config from "./assets/js/config"
import { genGrids, type GridData } from './assets/js/GridsMethods'
// import MojsExample from './test.jsx';


export type snapshot = {
  t: string,
  g: GridData[],
  i: number[]
}

// 初始化
const defaultGrids = genGrids(Config.Size, Config.Variety)
console.log('Generated grids:', defaultGrids);

// ？？？
const MemoUnderground = memo(Underground)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AnimateEndContext = createContext((_index: number) => { })

// 播放计时器
let playTimer = 0

function App() {
  const [score, setScore] = useState(0)
  const [grids, setGrids] = useState<GridData[]>(defaultGrids);
  const [isPlaying, setIsPlaying] = useState(false)
  const queueAnimateEndRef = useRef(new Set<number>())
  const SnapshotsRef = useRef<snapshot[]>([])
  const [myOres, setMyOres] = useState(Array(Config.Variety).fill(0))


  function saveSnapshotHandler(snapshot: snapshot) {
    console.log(snapshot);

    SnapshotsRef.current.push(snapshot)

    clearTimeout(playTimer)
    playTimer = setTimeout(playSnapshots)
    // console.log('dothis', { playSnapshots, snaps: SnapshotsRef.current })
  }


  const playSnapshots = () => {
    const nextGrids = SnapshotsRef.current.shift()
    if (nextGrids) {
      setIsPlaying(true)
      const { t, g, i } = nextGrids

      setGrids(g)
      queueAnimateEndRef.current = new Set(i.flat())
    } else {
      setIsPlaying(false)
    }
  }

  function onAnimateEnd(index: number) {
    const queue = queueAnimateEndRef.current
    if (queue.size === 0) return

    queue.delete(index)

    if (queue.size === 0) {
      playSnapshots()
    }
  }


  return (
    <>
      {/* <MojsExample duration={dur} /> */}
      <h1>Dig Deeper</h1>
      <Inventory items={myOres}></Inventory >
      <AnimateEndContext.Provider value={onAnimateEnd}>
        <MemoUnderground
          grids={grids}
          saveSnapshot={saveSnapshotHandler}
          selectable={!isPlaying}
        ></MemoUnderground>
      </AnimateEndContext.Provider>
    </>
  )
}

export default App
export { AnimateEndContext }
