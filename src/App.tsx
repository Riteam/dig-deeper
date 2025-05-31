import { createContext, memo, useState } from 'react'
import './App.css'
import Underground from './Underground';

// import MojsExample from './test.jsx';



const MemoUnderground = memo(Underground)

const config = {
  size: 8, // 棋盘尺寸
  variety: 7 // 矿石种类数量
}

const SizeContext = createContext(config.size)
function App() {


  // const [dur, setDur] = useState(1000)

  // setTimeout(() => {
  //   console.log(123);

  //   setDur(5000)
  // }, 5000);


  return (
    <>
      {/* <MojsExample duration={dur} /> */}
      <h1>Dig Deeper</h1>
      <SizeContext.Provider value={config.size}>
        <MemoUnderground type={0} variety={config.variety} size={config.size}></MemoUnderground>
      </SizeContext.Provider>
    </>
  )
}

export default App
export { SizeContext }
