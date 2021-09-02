import fs from 'fs';
import chokidar from 'chokidar';

export class FileWatcher {
  private files: string[] = [];
  private ready = false;
  private processing = false;

  constructor(private path: string, private onFile: (path: string) => Promise<void>) {
    if (!path) {
      throw new Error('path is missing');
    }
  }

  async start() {
    await fs.promises.mkdir(this.path, { recursive: true });

    const watcher = chokidar.watch(this.path, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: true,
    });

    watcher
      .on('add', path => {
        this.files.push(path);
        this.next();
      })
      .on('ready', () => {
        this.ready = true;
        this.next();
      });
  }

  private next() {
    if (this.ready && !this.processing && this.files.length) {
      this.processing = true;
      const file = this.files.shift();
      this
        .onFile(file!)
        .catch(err => console.error(err))
        .finally(() => {
          this.processing = false;
          this.next();
        });
    }
  }
}
