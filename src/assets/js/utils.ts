let idCount = 1

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
  }
}

export default Utils
