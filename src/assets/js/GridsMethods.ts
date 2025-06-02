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
      console.log('差点有个方块', i);

      exclude.push(grids[i - 1].type)
    }

    grids.push(genGrid(variety, -1, exclude))
  }
  return grids
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

  if (res.length) res.push(startIndex)

  return [...new Set(res)]
}

export function findSquare(grids: GridData[], startIndex: number) {
  const size = grids.length ** .5

  const { type } = grids[startIndex]

  function getFour(idx: number): number[] {
    return [idx, idx + 1, idx + size, idx + size + 1]
  }
  for (const i of getFour(startIndex - size - 1)) {
    if (i >= 0) {
      const currFour = getFour(i)
      if (currFour.every(j => grids[j]?.type === type)) {
        return currFour
      }
    }
  }

  return []
}
