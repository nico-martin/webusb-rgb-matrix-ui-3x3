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
  oneMatrixSideLength: number = 16
): number[] => {
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

  Object.entries(splitUp).map(([key, smallMatrix]) => {
    //console.log(key, gridMatrixToNeopixelArray(smallMatrix))
  });

  let full = [];
  Object.values(splitUp).map((smallMatrix) => {
    full = [...full, ...gridMatrixToNeopixelArray(smallMatrix)];
  });

  return full;
};

export const wait = (ms: number = 2000): Promise<void> =>
  new Promise((resolve) => window.setTimeout(() => resolve(), ms));
