import Utils from "./utils"

export interface GridData {
  id: number
  type: number
  initPos: number
}
// 生成一个随机矿单位
export function genGrid(variety: number, initPos: number = -1, exclude: number[] = []): GridData {
  const include = []
  for (let i = 0; i < variety; i++) {
    if (!exclude.includes(i)) include.push(i)
  }
  return {
    id: Utils.getUniqueId(),
    type: include[Math.random() * include.length | 0],
    initPos
  }
}

// 生成矿床矩阵
export function genGrids(size: number, variety: number) {
  const grids: GridData[] = []
  for (let i = 0; i < size ** 2; i++) {
    const exclude = []
    // 检查左边有没有两个一样的，有的话不能再一样
    if (
      i % size >= 2
      && grids[i - 1].type === grids[i - 2].type
    ) {
      exclude.push(grids[i - 1].type)
    }

    // 检查上边有没有两个一样的，有的话不能再一样
    if (
      i >= size * 2
      && grids[i - size].type === grids[i - size * 2].type
    ) {
      exclude.push(grids[i - size].type)
    }

    // 检查左上角有没有三个一样的，有的话不能再一样
    if (i > size
      && i % size >= 1
      && grids[i - 1].type === grids[i - size].type
      && grids[i - 1].type === grids[i - size - 1].type
    ) {
      exclude.push(grids[i - 1].type)
    }

    grids.push(genGrid(variety, -1, exclude))
  }
  return grids
}

function swapAndCheck(grids: GridData[], i1: number, i2: number) {
  // if (Utils.isAdjacent(i1, i2, grids.length ** 0.5)) return false
  Utils.swap(grids, i1, i2)
  for (const i of [i1, i2]) {
    const l1 = findMatch3(grids, i).length
    const l2 = findSquare(grids, i).length
    if (l1 + l2 > 0) {
      Utils.swap(grids, i1, i2)
      return true
    }
  }

  Utils.swap(grids, i2, i1)
  return false
}
export function checkGrids(grids: GridData[]) {
  const size = grids.length ** 0.5
  for (let i = 0; i < grids.length; i++) {

    // 有TNT直接返回true
    if (grids[i].type === 100) return true

    const [row, col] = Utils.getXY(i, size)
    // 向右交换
    if (row < size - 1) {
      if (swapAndCheck(grids, i, i + 1))
        return [i, i + 1]
    }
    // 向下交换
    if (col < size - 1) {
      if (swapAndCheck(grids, i, i + size))
        return [i, i + size]
    }
  }

  return false
}


export function findMatch3(
  grids: GridData[],
  startIndex: number
) {
  const size = grids.length ** 0.5
  const { type } = grids[startIndex]
  const [row] = Utils.getXY(startIndex, size);

  // 边界
  const
    left = row * size
    , right = (row + 1) * size - 1
    , bottom = size * size - 1
    , res: number[] = []

  // 检查水平方向（左和右）
  const leftPoints = [];
  let j = startIndex - 1;
  while (j >= left && grids[j].type === type) {
    leftPoints.push(j);
    j--;
  }

  const rightPoints = [];
  j = startIndex + 1;
  while (j <= right && grids[j].type === type) {
    rightPoints.push(j);
    j++;
  }

  if (leftPoints.length + rightPoints.length + 1 >= 3) {
    res.push(...leftPoints, ...rightPoints);
  }

  // 检查垂直方向（上和下）
  const upPoints = [];
  j = startIndex - size;
  while (j >= 0 && grids[j].type === type) {
    upPoints.push(j);
    j -= size;
  }

  const downPoints = [];
  j = startIndex + size;
  while (j <= bottom && grids[j].type === type) {
    downPoints.push(j);
    j += size;
  }

  if (upPoints.length + downPoints.length + 1 >= 3) {
    res.push(...upPoints, ...downPoints);
  }

  if (res.length) res.unshift(startIndex)

  return [...new Set(res)]
}

function isInBoundary(i: number, size: number) {
  return i >= 0 && i < size
}
export function findSquare(grids: GridData[], startIndex: number) {
  const size = grids.length ** .5
  const { type } = grids[startIndex]
  const dir = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ]
  const [row, col] = Utils.getXY(startIndex, size)

  for (const [d1, d2] of dir) {
    const r = row + d1
    const c = col + d2

    if (isInBoundary(c, size) && isInBoundary(r, size)) {
      const res = [
        startIndex,
        Utils.toIndex(size, r, c),
        Utils.toIndex(size, r, col),
        Utils.toIndex(size, row, c)
      ]

      if (res.every(i => grids[i].type === type)) {
        return res
      }
    }
  }

  return []
}

export function shuffle(grids: GridData[]) {
  const g = [...grids]
  for (let i = 0; i < g.length; i++) {
    const j = Math.random() * g.length | 0
    Utils.swap(g, i, j)
  }
  if (checkGrids(g)) return g
  else return shuffle(g)
}