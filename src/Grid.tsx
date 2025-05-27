import { useEffect, useRef, useState } from 'react'

type GridProps = {
  type?: number,
  num: number
}

function Grid({ num = 2 }: GridProps) {
  const [displayNum, setDisplayNum] = useState(num)
  const prevNumRef = useRef(num)

  useEffect(() => {
    const prevNum = prevNumRef.current
    if (Math.abs(num - prevNum) > 20) {
      let start = prevNum
      const step = (num - prevNum) / 20
      let current = 0
      const interval = setInterval(() => {
        current++
        start += step
        if (current >= 20) {
          setDisplayNum(num)
          clearInterval(interval)
        } else {
          setDisplayNum(Math.round(start))
        }
      }, 20)
    } else {
      setDisplayNum(num)
    }
    prevNumRef.current = num
  }, [num])

  return (
    <div className='Grid'>
      {displayNum}
    </div>
  )
}

export default Grid