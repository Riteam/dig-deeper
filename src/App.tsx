import { useState } from 'react'
import './App.css'
import Underground from './Underground';

const config = {
  size: 8,
}
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Underground type={0} num={count} size={config.size}></Underground>
      <div className="card">
        <button onClick={() => setCount((count) => (count + Math.random() * 50) | 0)}>
          count is {count}
        </button><h1></h1>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
