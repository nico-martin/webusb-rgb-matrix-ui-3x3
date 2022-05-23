export type rgbT = [r: number, g: number, b: number];

export const array = (length: number): null[] =>
  new Array(length).fill('').map(() => null);

export const getGridMatrix = (
  [r, g, b]: rgbT = [0, 0, 0],
  size: number = 16
): rgbT[][] => array(size).map(() => array(size).map(() => [r, g, b]));

export const arrayFlat = <T = any>(array: T[][]): T[] =>
  array.reduce((acc, current) => [...acc, ...current], []);

export const gridMatrixToNeopixelArray = (gridMatrix: rgbT[][]): number[] => {
  const size = gridMatrix.length;
  const ledMatrix: rgbT[][] = getGridMatrix();
  gridMatrix.map((col, rowIndex) =>
    col.map((pixel, colIndex) => {
      ledMatrix[rowIndex][rowIndex % 2 !== 1 ? size - colIndex - 1 : colIndex] =
        pixel;
    })
  );

  return arrayFlat<number>(arrayFlat<rgbT>(ledMatrix));
};

export const gridMatrixToNeopixelArray3x3 = (
  canvasGridMatrix: rgbT[][],
  oneMatrixSideLength: number = 16,
  matrixSideCount: number = 3
): number[] => {
  /*
  const matrixSideLength = oneMatrixSideLength * matrixSideCount;
  const ledGridMatrix: rgbT[][] = array(matrixSideLength).map((e, rowIndex) =>
    array(matrixSideLength).map((e, colIndex) => {
      return gridMatrix[rowIndex][colIndex];
    })
  );

  return arrayFlat<number>(arrayFlat<rgbT>(ledGridMatrix));
  */

  // split up canvas grid into the nine matrices
  const splitUp: Record<string, rgbT[][]> = {
    '0/0': [],
    '0/1': [],
    '0/2': [],
    '1/2': [],
    '1/1': [],
    '1/0': [],
    '2/0': [],
    '2/1': [],
    '2/2': [],
  };
  canvasGridMatrix.map((cols, rowIndex) =>
    cols.map((pixel, colIndex) => {
      const rowGrid = Math.floor(rowIndex / oneMatrixSideLength);
      const colGrid = Math.floor(colIndex / oneMatrixSideLength);
      const newRow = rowIndex - rowGrid * oneMatrixSideLength;
      const newCol = colIndex - colGrid * oneMatrixSideLength;

      if (!splitUp[rowGrid + '/' + colGrid][newRow]) {
        splitUp[rowGrid + '/' + colGrid][newRow] = [];
      }
      splitUp[rowGrid + '/' + colGrid][newRow][newCol] = pixel;
    })
  );

  Object.entries(splitUp).map(([key, smallMatrix]) =>
    console.log(key, gridMatrixToNeopixelArray(smallMatrix))
  );

  let full = [];
  Object.values(splitUp).map((smallMatrix) => {
    full = [...full, ...gridMatrixToNeopixelArray(smallMatrix)];
  });

  return full;

  /*

const matrixCount = matrixSideCount * matrixSideCount;
const oneMatrixSize = oneMatrixSideLength * oneMatrixSideLength;
const flattedCanvasGrid = arrayFlat<rgbT>(gridMatrix);
const pixel: rgbT[] = array(oneMatrixSize * matrixCount).map(
(e, elementIndex) => {
const grid;
return [0, 0, 0];
const elementNumber = i + 1;
const gridNumber = Math.ceil(elementNumber / oneMatrixSize);
const numberInGrid = elementNumber - oneMatrixSize * (gridNumber - 1);
const indexInGrid = numberInGrid - 1;
const row = Math.floor(indexInGrid / oneMatrixSideLength) + 1;
let indexInCanvas = indexInGrid;
if (row % 2 === 1) {
indexInCanvas =
  (indexInGrid -
    (row - 1) * oneMatrixSideLength -
    oneMatrixSideLength +
    1) *
    -1 +
  (row - 1) * oneMatrixSideLength;
}
const indexInFullCanvas = indexInCanvas + oneMatrixSize * (gridNumber - 1);
return flattedCanvasGrid[indexInFullCanvas];
    }
  );

  return arrayFlat(pixel);*/

  /*

  const size = gridMatrix.length;
  const ledMatrix: rgbT[][] = getGridMatrix([0, 0, 0], 16 * 3);
  gridMatrix.map((col, rowIndex) =>
    col.map((pixel, colIndex) => {
      ledMatrix[rowIndex][rowIndex % 2 !== 1 ? size - colIndex - 1 : colIndex] =
        pixel;
    })
  );

  return arrayFlat<number>(arrayFlat<rgbT>(ledMatrix));*/
};

export const wait = (ms: number = 2000): Promise<void> =>
  new Promise((resolve) => window.setTimeout(() => resolve(), ms));
