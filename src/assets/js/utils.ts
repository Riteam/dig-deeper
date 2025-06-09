let idCount = 1000

const Utils = {
  getXY(index: number, size: number): [number, number] {
    return [(index / size) | 0, index % size]
  },
  toIndex(size: number, row: number, col: number) {
    return row * size + col
  },
  swap(arr: unknown[], i: number, j: number): void {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  },
  getUniqueId(): number {
    return idCount++
  },

  isAdjacent(i1: number, i2: number, size: number): boolean {
    const [r1, c1] = Utils.getXY(i1, size),
      [r2, c2] = Utils.getXY(i2, size)

    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
  },

  range(step: number, max: number, start = 0) {
    const res = []
    for (let i = start; i < max; i += step)
      res.push(i)

    return res
  },

  // 检查是否为直线
  checkIsLine(points: [number, number][]): boolean {
    const [x1, y1] = points[0]
    const isHorizontal = points.every(([_, y]) => y === y1)
    const isVertical = points.every(([x]) => x === x1)
    return isHorizontal || isVertical
  },

  // 检查是否为L形
  checkIsL(points: [number, number][]): boolean {
    if (points.length < 5) return false

    // 获取所有点的x和y坐标
    // const xs = points.map(([x]) => x)
    // const ys = points.map(([, y]) => y)

    // 找到最长的水平或垂直线段
    const horizontalLine = this.findLongestLine(points, true)
    const verticalLine = this.findLongestLine(points, false)

    // 如果水平线段和垂直线段都至少包含3个点，且它们共享一个端点
    if (horizontalLine.length >= 3 && verticalLine.length >= 3) {
      const horizontalEnds = [horizontalLine[0], horizontalLine[horizontalLine.length - 1]]
      const verticalEnds = [verticalLine[0], verticalLine[verticalLine.length - 1]]

      // 检查是否共享端点
      return horizontalEnds.some(h => verticalEnds.some(v =>
        h[0] === v[0] && h[1] === v[1]
      ))
    }

    return false
  },

  // 检查是否为T形
  checkIsT(points: [number, number][]): boolean {
    if (points.length < 5) return false

    // 找到最长的水平线段
    const horizontalLine = this.findLongestLine(points, true)
    if (horizontalLine.length < 3) return false

    // 找到中间点
    const midPoint = horizontalLine[Math.floor(horizontalLine.length / 2)]

    // 检查中间点上方或下方是否有至少2个点
    const verticalPoints = points.filter(([x, y]) =>
      x === midPoint[0] && y !== midPoint[1]
    )

    return verticalPoints.length >= 2
  },

  // 检查是否为十字形
  checkIsCross(points: [number, number][]): boolean {
    if (points.length < 5) return false

    // 找到中心点（如果存在）
    const centerPoint = this.findCenterPoint(points)
    if (!centerPoint) return false

    // 检查中心点周围四个方向是否都有至少2个点
    const directions = [
      points.filter(([x, y]) => x === centerPoint[0] && y < centerPoint[1]), // 上
      points.filter(([x, y]) => x === centerPoint[0] && y > centerPoint[1]), // 下
      points.filter(([x, y]) => y === centerPoint[1] && x < centerPoint[0]), // 左
      points.filter(([x, y]) => y === centerPoint[1] && x > centerPoint[0])  // 右
    ]

    return directions.every(dir => dir.length >= 2)
  },

  // 辅助函数：找到最长的水平或垂直线段
  findLongestLine(points: [number, number][], isHorizontal: boolean): [number, number][] {
    // 按x或y坐标排序
    const sorted = [...points].sort((a, b) => isHorizontal ? a[0] - b[0] : a[1] - b[1])

    let currentLine: [number, number][] = []
    let longestLine: [number, number][] = []

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const prev = sorted[i - 1]

      if (i === 0 || (isHorizontal ?
        current[0] === prev[0] + 1 && current[1] === prev[1] :
        current[1] === prev[1] + 1 && current[0] === prev[0])) {
        currentLine.push(current)
      } else {
        if (currentLine.length > longestLine.length) {
          longestLine = [...currentLine]
        }
        currentLine = [current]
      }
    }

    if (currentLine.length > longestLine.length) {
      longestLine = [...currentLine]
    }

    return longestLine
  },

  // 辅助函数：找到中心点
  findCenterPoint(points: [number, number][]): [number, number] | null {
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)

    const centerX = Math.round((Math.min(...xs) + Math.max(...xs)) / 2)
    const centerY = Math.round((Math.min(...ys) + Math.max(...ys)) / 2)

    // 检查中心点是否在点集中
    const centerPoint = points.find(([x, y]) => x === centerX && y === centerY)
    return centerPoint || null
  },

  // 辅助函数：判断是否为2x2方块
  isSquareShape(pos: number[], size: number): boolean {
    if (pos.length !== 4) return false

    // 获取所有点的坐标
    const points = pos.map(p => Utils.getXY(p, size))

    // 检查是否形成2x2的方块
    // 首先检查是否所有点都在同一行或同一列
    const allX = points.map(p => p[0])
    const allY = points.map(p => p[1])

    // 检查x坐标是否只有两个不同的值，且相差为1
    const uniqueX = [...new Set(allX)]
    if (uniqueX.length !== 2 || Math.abs(uniqueX[0] - uniqueX[1]) !== 1) return false

    // 检查y坐标是否只有两个不同的值，且相差为1
    const uniqueY = [...new Set(allY)]
    if (uniqueY.length !== 2 || Math.abs(uniqueY[0] - uniqueY[1]) !== 1) return false

    // 检查是否每个点都与其他点相连
    // for (let i = 0; i < points.length; i++) {
    //   let hasNeighbor = false
    //   for (let j = 0; j < points.length; j++) {
    //     if (i === j) continue
    //     const dx = Math.abs(points[i][0] - points[j][0])
    //     const dy = Math.abs(points[i][1] - points[j][1])
    //     if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
    //       hasNeighbor = true
    //       break
    //     }
    //   }
    //   if (!hasNeighbor) return false
    // }

    return true
  }
}

export default Utils
