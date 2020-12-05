import React from 'react';

export default function flip(props) {
  let { score } = props
  // const [count, setCount] = useState(0);
  return (
    <div>
      分数：{score}
    </div>
  )
}