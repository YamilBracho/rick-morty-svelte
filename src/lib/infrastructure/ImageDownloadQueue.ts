/**
 * controla la concurrencia y la frecuencia de las descargas usando
 * una cola
 * 
 * Yamil Bracho
 * 2026-Nov-11
 */

type QueueTask<T> = () => Promise<T>;

interface QueueItem {
  start: () => void;
  cancel: () => void;
}

export class ImageDownloadQueue {
  private readonly maxConcurrent: number;
  private readonly minInterval: number;

  private activeDownloads = 0;
  private lastRequestTime = 0;

  private timer: ReturnType<typeof setTimeout> | undefined;

  private readonly queue: QueueItem[] = [];

  constructor(maxConcurrent: number = 2, minInterval: number = 500) {
    this.maxConcurrent = maxConcurrent;
    this.minInterval = minInterval;
  }

  /**
   * Ejecuta descarga de la imagen a la cola
   * @param task 
   * @param signal 
   * @returns 
   */
  execute<T>(task: QueueTask<T>, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      let item: QueueItem;

      const onAbort = () => {
        const index = this.queue.indexOf(item);

        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new DOMException("Aborted", "AbortError"));
          this.processQueue();
        }
      };

      item = {
        start: () => {
          signal?.removeEventListener("abort", onAbort);

          if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }

          this.activeDownloads++;
          this.lastRequestTime = Date.now();

          void task()
            .then(resolve, reject)
            .finally(() => {
              this.activeDownloads--;
              this.processQueue();
            });
        },

        cancel: onAbort,
      };

      signal?.addEventListener("abort", onAbort, { once: true });

      this.queue.push(item);
      this.processQueue();
    });
  }

  /**
   * procesa cola de imagenes que estan pendientes para descarga
   * @returns 
   */
  private processQueue(): void {
    if (this.activeDownloads >= this.maxConcurrent) return;
    if (this.queue.length === 0) return;

    const elapsed = Date.now() - this.lastRequestTime;
    const remaining = this.minInterval - elapsed;

    if (remaining > 0) {
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.timer = undefined;
          this.processQueue();
        }, remaining);
      }

      return;
    }

    const nextTask = this.queue.shift();

    if (nextTask) {
      nextTask.start();
      this.processQueue();
    }
  }
}
