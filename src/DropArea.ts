class DropArea {
  target: HTMLDivElement = null;

  constructor(element: HTMLDivElement, callback: (file: File) => void) {
    if (element) {
      this.target = element;
      this.setEventListener(callback);
      this.setupInput(callback);
    }
  }

  private setEventListener(callback: (file: File) => void) {
    document.body.addEventListener('dragenter', (e) => {});
    document.body.addEventListener('dragleave', (e) => {});
    document.body.addEventListener('dragover', DropArea.onDragOver);
    document.body.addEventListener('drop', (e) => DropArea.onDrop(e, callback));

    this.target.addEventListener('dragenter', this.onDragEnter.bind(this));
    this.target.addEventListener('dragleave', this.onDragLeave.bind(this));
    this.target.addEventListener('dragover', DropArea.onDragOver);
    this.target.addEventListener('drop', (e) => DropArea.onDrop(e, callback));
    this.target.setAttribute('data-focus', 'false');
  }

  private setupInput(callback) {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    this.target.append(input);
    this.target.addEventListener('click', () => input.click());
    input.addEventListener('change', (ev) =>
      callback((ev.target as HTMLInputElement).files[0])
    );
  }

  private onDragEnter(e) {
    this.target.setAttribute('data-focus', 'true');
  }

  private onDragLeave(e) {
    this.target.setAttribute('data-focus', 'false');
  }

  private static onDragOver(e) {
    e.preventDefault();
  }

  private static onDrop(e, callback) {
    e.preventDefault();
    e.target.setAttribute('data-focus', 'false');
    const dt = e.dataTransfer;
    const files = dt.files;
    callback(files[0]);
  }
}

export default DropArea;
