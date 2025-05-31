
const Utils = {
  getXY(index: number, size: number): [number, number] {
    return [(index / size) | 0, index % size]
  },
  swap(arr: unknown[], i: number, j: number): void {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

export default Utils
