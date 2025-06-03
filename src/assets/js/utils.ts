let idCount = 1

const Utils = {
  getXY(index: number, size: number): [number, number] {
    return [(index / size) | 0, index % size]
  },
  swap(arr: unknown[], i: number, j: number): void {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  },
  getUniqueId(): number {
    return idCount++
  },

  isAdjacent(i1: number, i2: number, rowDistance: number): boolean {
    return Math.abs(i1 - i2) === 1
      || Math.abs(i1 - i2) === rowDistance;
  },

  range(step: number, max: number, start = 0) {
    const res = []
    for (let i = start; i < max; i += step)
      res.push(i)

    return res
  }
}

export default Utils
