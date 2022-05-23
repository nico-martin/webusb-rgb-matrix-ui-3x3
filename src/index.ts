import WebUSBController from './WebUSBController';
import DropArea from './DropArea';
import {
  rgbT,
  getGridMatrix,
  gridMatrixToNeopixelArray,
  gridMatrixToNeopixelArray3x3,
  wait,
  array,
  arrayFlat,
} from './utils';
import { loadImageFromSrc, srcFromFile } from './image';

const SINGLE_MATRIX_SIZE = 16;
const MATRIX_COUNT_H = 3;

(function () {
  document.addEventListener('DOMContentLoaded', (event) => {
    const Controller = new WebUSBController();
    const textDecoder = new TextDecoder('utf-8');
    const $canvas = document.querySelector<HTMLCanvasElement>('#image-canvas');
    const $pixelArea = document.querySelector<HTMLDivElement>('#matrix');
    const $connectArea =
      document.querySelector<HTMLDivElement>('#connect-area');
    const $connectButton =
      document.querySelector<HTMLButtonElement>('#connect');
    const $connectButtonSkip =
      document.querySelector<HTMLButtonElement>('#connect-skip');
    const $dropArea = document.querySelector<HTMLInputElement>('#drop');

    let gridMatrix: rgbT[][] = getGridMatrix([0, 0, 0], 0);

    /**
     * Methods
     */

    const setUpMatrix = (size: number): void => {
      $canvas.width = size;
      $canvas.height = size;
      $pixelArea.style['grid-template-columns'] = `repeat(${size}, 1fr)`;
      $pixelArea.style['grid-template-rows'] = `repeat(${size}, 1fr)`;
      $pixelArea.querySelectorAll('.matrix__pixel').forEach((e) => e.remove());
      gridMatrix = getGridMatrix([0, 0, 0], size);

      let i = 0;
      gridMatrix.map((cols) =>
        cols.map(() => {
          const el = document.createElement('div');
          el.classList.add('matrix__pixel');
          el.setAttribute('data-pixelindex', String(i));
          $pixelArea.appendChild(el);
          i++;
        })
      );
    };

    const onFileChange = async (file: File) => {
      $pixelArea.setAttribute('data-loading', 'true');
      const src = await srcFromFile(file);
      $dropArea.style.backgroundImage = `url(${src})`;
      const ctx = $canvas.getContext('2d');
      const image = await loadImageFromSrc(src);

      const imgSize: number = Math.min(image.width, image.height);
      const left: number = (image.width - imgSize) / 2;
      const top: number = (image.height - imgSize) / 2;
      ctx.drawImage(
        image,
        left,
        top,
        imgSize,
        imgSize,
        0,
        0,
        $canvas.width,
        $canvas.height
      );

      gridMatrix = gridMatrix.map((cols, rowIndex) =>
        cols.map((pixel, colIndex) => {
          const canvasColor = ctx.getImageData(colIndex, rowIndex, 1, 1).data;
          return [canvasColor[0], canvasColor[1], canvasColor[2]];
        })
      );

      await wait(1000);
      await reDrawMatrix();
      $pixelArea.setAttribute('data-loading', 'false');
    };

    const reDrawMatrix = async () => {
      let i = 0;
      gridMatrix.map((cols) =>
        cols.map(([r, g, b]) => {
          const el = document.querySelector<HTMLDivElement>(
            `[data-pixelindex="${i}"]`
          );
          el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          i++;
        })
      );

      await Controller.send(
        new Uint8Array(gridMatrixToNeopixelArray3x3(gridMatrix))
        //new Uint8Array(arrayFlat(array(16 * 16 * 9).map(() => [0, 255, 0])))
      );
    };

    /**
     * Setup
     */

    setUpMatrix(SINGLE_MATRIX_SIZE * MATRIX_COUNT_H);

    new DropArea(
      document.querySelector<HTMLInputElement>('#drop'),
      onFileChange
    );

    $connectButton.addEventListener('click', async () => {
      await Controller.connect({ filters: [{ vendorId: 0x2341 }] });
      await Controller.send(
        new Uint8Array(gridMatrixToNeopixelArray(gridMatrix))
      );
    });

    $connectButtonSkip.addEventListener('click', async () => {
      $connectArea.style.display = 'none';
    });

    Controller.onReceive((data) => {
      console.log('received', { data, decoded: textDecoder.decode(data) });
    });

    Controller.onDeviceConnect((device) => {
      if (device) {
        $connectArea.style.display = 'none';
      } else {
        $connectArea.style.display = 'flex';
      }
    });
  });
})();
