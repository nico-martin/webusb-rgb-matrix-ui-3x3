export const srcFromFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      resolve(String(e.target.result));
    };
    fr.readAsDataURL(file);
  });

export const loadImageFromSrc = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = src;
  });
