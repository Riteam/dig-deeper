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

const scoreCalculator = (countAtOnce: number) => {
  let score = 100
  countAtOnce -= 3

  if (countAtOnce > 0) {
    score += 150
    countAtOnce--
  }
  if (countAtOnce > 0) {
    score += 200
    countAtOnce--
  }
  if (countAtOnce > 0) {
    score += countAtOnce * 300
  }

  return score
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
  // 总分
  const [score, setScore] = useState(0)
  // 显示单次加分量
  const [addingScore, setAddingScore] = useState(0)


  // 是否正在播放
  const [isPlaying, setIsPlaying] = useState(false)

  // 记录正在放动画的格子的 index
  const queueAnimateEndRef = useRef(new Set<number>())


  // 游戏棋盘数据
  const [grids, setGrids] = useState<GridData[]>(defaultGrids);
  // 游戏快照，用于回溯和播放
  const SnapshotsRef = useRef<snapshot[]>([])

  // 挖矿得到的矿石
  const [myOres, setMyOres] = useState(Array(Config.Variety).fill(0))

  const [multiple, setMultiple] = useState(0)

  function saveSnapshotHandler(snapshot: snapshot) {
    console.log(snapshot);

    SnapshotsRef.current.push(snapshot)

    clearTimeout(playTimer)
    playTimer = setTimeout(_ => {
      setMultiple(0)
      playSnapshots()
    })
    // console.log('dothis', { playSnapshots, snaps: SnapshotsRef.current })
  }


  const playSnapshots = () => {
    const nextGrids = SnapshotsRef.current.shift()
    if (nextGrids) {
      setIsPlaying(true)
      const { t, g, i } = nextGrids

      // 计分
      if (t === 'mined') {
        const countAtOnce = i.length
        const ores = [...myOres]
        for (const index of i) {
          const { type } = grids[index]
          if (type >= 0) {
            ores[type] += 1
          }
        }

        const adding = scoreCalculator(countAtOnce)
        setMyOres([...ores])

        const mul = multiple + 1
        setScore(pre => {
          return pre + adding * mul
        })
        setMultiple(mul)
        setAddingScore(adding)
      }

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
      <h1>
        {score} <span>+{addingScore}</span>
        {multiple > 1 ? <span>x {multiple}</span> : null}
      </h1>
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
