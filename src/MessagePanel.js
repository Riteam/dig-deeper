import React from 'react';

export default function MessagePanel(props) {
  let { score } = props
  // const [count, setCount] = useState(0);
  return (
    <div className="panel">
      分数：<i className="scoreNum">{score}</i>
    </div>
  )
}