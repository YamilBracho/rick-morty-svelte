
<script lang="ts">
  import { onMount } from 'svelte';

  import type { Character } from '#lib/models/Character';
  import { imageCacheService } from '#lib/services';

  let { character }: { character: Character } = $props();

  let imageContainer: HTMLDivElement;

  let imageUrl = $state<string | null>(null);
  let imageFailed = $state(false);
  let imageLoaded = $state(false);

  let imageController: AbortController | undefined;

  /**
   * Loads the character image.
   * Supports cancellation and manual retries.
   */
  async function loadImage(): Promise<void> {
    imageFailed = false;
    imageLoaded = false;

    // Release the previous Blob URL when retrying.
    if (imageUrl) {
      imageCacheService.releaseImageUrl(character.image);
      imageUrl = null;
    }

    // Cancel any previous request.
    imageController?.abort();

    const controller = new AbortController();
    imageController = controller;

    try {
      const url = await imageCacheService.getImageUrl(
        character.image,
        controller.signal
      );

      // Ignore results from obsolete requests.
      if (
        controller.signal.aborted ||
        imageController !== controller
      ) {
        imageCacheService.releaseImageUrl(character.image);
        return;
      }

      imageUrl = url;

    } catch (error: unknown) {
      if (controller.signal.aborted) {
        return;
      }

      if (imageController !== controller) {
        return;
      }

      console.error(
        `Error loading image for ${character.name}:`,
        error
      );

      imageFailed = true;
    }
  }

  /**
   * Called when the image finishes loading in the browser.
   */
  function handleImageLoad(): void {
    imageLoaded = true;
  }

  /**
   * Called when the browser cannot display the image.
   */
  function handleImageError(): void {
    imageFailed = true;
    imageLoaded = false;
  }

  onMount(() => {
    imageController = new AbortController();

    // Observe the image container.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          // Only load once when the card approaches the viewport.
          observer.disconnect();

          void loadImage();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0
      }
    );

    observer.observe(imageContainer);

    // Component cleanup.
    return () => {
      observer.disconnect();

      imageController?.abort();

      if (imageUrl) {
        imageCacheService.releaseImageUrl(character.image);
      }
    };
  });
</script>

<div class="character-card">

  <!-- Character image -->
  <div
    class="character-image"
    bind:this={imageContainer}
  >
    {#if imageFailed}

      <div class="image-placeholder">
        <p>Unable to load image</p>

        <button
          class="retry-button"
          onclick={() => void loadImage()}
        >
          Try again
        </button>
      </div>

    {:else if imageUrl}

      <img
        src={imageUrl}
        alt={character.name}
        decoding="async"
        onload={handleImageLoad}
        onerror={handleImageError}
        class:loaded={imageLoaded}
      />

      {#if !imageLoaded}
        <div class="image-loading">
          Loading image...
        </div>
      {/if}

    {:else}

      <div class="image-placeholder">
        Loading image...
      </div>

    {/if}
  </div>

  <!-- Character information -->
  <div class="character-info">
    <h2>{character.name}</h2>

    <p>
      <strong>Status:</strong>
      {character.status}
    </p>

    <p>
      <strong>Species:</strong>
      {character.species}
    </p>

    <p>
      <strong>Gender:</strong>
      {character.gender}
    </p>
  </div>

</div>

<style>
  .character-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.2s ease;
  }

  .character-card:hover {
    transform: translateY(-4px);
  }

  .character-image {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: #f1f1f1;
  }

  .character-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .character-image img.loaded {
    opacity: 1;
  }

  .image-placeholder,
  .image-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    text-align: center;
    color: #666;
  }

  .retry-button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .retry-button:hover {
    background-color: #1d4ed8;
  }

  .character-info {
    padding: 16px;
  }

  .character-info h2 {
    margin: 0 0 12px;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .character-info p {
    margin: 6px 0;
  }
</style>
