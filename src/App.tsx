import { createContext, memo } from 'react'
import './App.css'
import Underground from './Underground';

const MemoUnderground = memo(Underground)

const config = {
  size: 8, // 棋盘尺寸
  variety: 7 // 矿石种类数量
}

const SizeContext = createContext(config.size)
function App() {
  return (
    <>
      <h1>Dig Deeper</h1>
      <SizeContext.Provider value={config.size}>
        <MemoUnderground type={0} variety={config.variety} size={config.size}></MemoUnderground>
      </SizeContext.Provider>
    </>
  )
}

export default App
export { SizeContext }
