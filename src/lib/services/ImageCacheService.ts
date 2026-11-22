/**
 * administra la caché de imágenes y las URLs locales
 */

import { ImageDownloadQueue } from "../infrastructure/ImageDownloadQueue";

export class ImageCacheService {
  private readonly cacheName = "rick-and-morty-images-v1";

  private readonly objectUrls = new Map<
    string,
    { url: string; refCount: number }
  >();

  private readonly pending = new Map<
    string,
    {
      promise: Promise<string>;
      controller: AbortController;
      consumers: number;
    }
  >();

  constructor(private readonly downloadQueue: ImageDownloadQueue) {}

  // Get Image via URL
  // First serach in local memory and if it does not find there
  // search in http server
  async getImageUrl(imageUrl: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const existing = this.objectUrls.get(imageUrl);

    if (existing) {
      existing.refCount++;
      return existing.url;
    }

    let request = this.pending.get(imageUrl);

    if (!request) {
      const controller = new AbortController();

      request = {
        controller,
        consumers: 0,
        promise: this.loadImage(imageUrl, controller.signal),
      };

      this.pending.set(imageUrl, request);
    }

    request.consumers++;

    try {
      const localUrl = await this.waitForRequest(request.promise, signal);

      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const entry = this.objectUrls.get(imageUrl);

      if (!entry) {
        throw new Error("Image cache entry not found.");
      }

      entry.refCount++;

      return localUrl;
    } finally {
      request.consumers--;

      if (request.consumers === 0 && this.pending.get(imageUrl) === request) {
        request.controller.abort();
      }
    }
  }
  // Loads image from server or from local storage
  private async loadImage(
    imageUrl: string,
    signal: AbortSignal,
  ): Promise<string> {
    try {
      const cache = await caches.open(this.cacheName);

      let response = await cache.match(imageUrl);
      if (!response) {
        response = await this.fetchImage(imageUrl, signal);

        await cache.put(imageUrl, response.clone());
      }

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      this.objectUrls.set(imageUrl, {
        url: localUrl,
        refCount: 0,
      });

      return localUrl;
    } finally {
      this.pending.delete(imageUrl);
    }
  }

  // Delete blob of the image from Local Storage
  releaseImageUrl(imageUrl: string): void {
    const entry = this.objectUrls.get(imageUrl);

    if (!entry) return;

    entry.refCount--;

    if (entry.refCount <= 0) {
      URL.revokeObjectURL(entry.url);
      this.objectUrls.delete(imageUrl);
    }
  }

  // Maneja Reintento en la descarga de la imagen
  private async fetchImage(
    imageUrl: string,
    signal: AbortSignal,
  ): Promise<Response> {
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await this.downloadQueue.execute(
        () => fetch(imageUrl, { signal }),
        signal,
      );

      if (response.status !== 429) {
        if (!response.ok) {
          throw new Error(`Unable to download image: HTTP ${response.status}`);
        }

        return response;
      }

      // No quedan más intentos.
      if (attempt === maxRetries) {
        throw new Error(
          "Image download failed: HTTP 429 after maximum retries.",
        );
      }

      const delay = this.getRetryDelay(response, attempt);

      console.warn(`HTTP 429. Retrying image download in ${delay} ms.`);

      await this.wait(delay, signal);
    }

    throw new Error("Image download failed.");
  }

  private getRetryDelay(response: Response, attempt: number): number {
    const retryAfter = response.headers.get("Retry-After");

    if (retryAfter) {
      // Retry-After puede expresar segundos.
      const seconds = Number(retryAfter);

      if (Number.isFinite(seconds)) {
        return Math.max(0, seconds * 1000);
      }

      // También puede expresar una fecha HTTP.
      const retryDate = Date.parse(retryAfter);

      if (!Number.isNaN(retryDate)) {
        return Math.max(0, retryDate - Date.now());
      }
    }

    // Backoff exponencial: 1 segundo, luego 2 segundos.
    return 1000 * Math.pow(2, attempt);
  }

  private wait(milliseconds: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const timer = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, milliseconds);

      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };

      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  private waitForRequest<T>(
    promise: Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    if (!signal) return promise;

    if (signal.aborted) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    return new Promise<T>((resolve, reject) => {
      const onAbort = () => {
        reject(new DOMException("Aborted", "AbortError"));
      };

      signal.addEventListener("abort", onAbort, { once: true });

      promise.then(
        (value) => {
          signal.removeEventListener("abort", onAbort);
          resolve(value);
        },
        (error: unknown) => {
          signal.removeEventListener("abort", onAbort);
          reject(error);
        },
      );
    });
  }
}
