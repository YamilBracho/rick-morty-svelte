<!-- 
  Pagina que muestra un grid de los personajes
  El usaurio puede filtrar y moverse entre paginas de personajes

  Yamil Bracho
  2026-Nov-11 
-->

<script lang="ts">
  import { onMount } from 'svelte';

  import CharacterCard from '#lib/components/CharacterCard.svelte';
  import { characterService } from '#lib/services';

  import type { Character } from '#lib/models/Character';
  import type { CharacterFilters } from '#lib/models/CharacterFilters';

  // Characters and loading states.
  let characters = $state<Character[]>([]);
  let isLoading = $state<boolean>(true);
  let errorMessage = $state<string | null>(null);

  // Pagination.
  let currentPage = $state<number>(1);
  let totalPages = $state<number>(0);

  // Filters currently being edited.
  let filterName = $state('');
  let filterStatus = $state('');
  let filterSpecies = $state('');

  // Filters currently applied.
  let activeFilters = $state<CharacterFilters>({});

  // Identifies the most recent request.
  let requestId = 0;

  /**
   * Loads characters from the API.
   */
  async function loadCharacters(
    page: number = currentPage,
    filters: CharacterFilters = activeFilters
  ): Promise<void> {

    const currentRequestId = ++requestId;

    try {
      isLoading = true;
      errorMessage = null;

      const response = await characterService.getCharacters(
        page,
        filters
      );

      // Ignore responses from previous requests.
      if (currentRequestId !== requestId) {
        return;
      }

      characters = response.results;
      totalPages = response.info.pages;
      currentPage = page;

    } catch (error: unknown) {

      if (currentRequestId !== requestId) {
        return;
      }

      errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

    } finally {

      // Only the latest request can update loading state.
      if (currentRequestId === requestId) {
        isLoading = false;
      }
    }
  }

  /**
   * Loads the next page.
   */
  function nextPage(): void {
    if (currentPage < totalPages && !isLoading) {
      void loadCharacters(currentPage + 1);
    }
  }

  /**
   * Loads the previous page.
   */
  function previousPage(): void {
    if (currentPage > 1 && !isLoading) {
      void loadCharacters(currentPage - 1);
    }
  }

  /**
   * Clears all filters and reloads the first page.
   */
  function clearFilters(): void {
    filterName = '';
    filterStatus = '';
    filterSpecies = '';

    activeFilters = {};

    void loadCharacters(1, {});
  }

  /**
   * Applies the filters entered by the user.
   */
  function applyFilters(): void {
    const newFilters: CharacterFilters = {
      ...(filterName.trim() && {
        name: filterName.trim()
      }),

      ...(filterStatus && {
        status: filterStatus as CharacterFilters['status']
      }),

      ...(filterSpecies.trim() && {
        species: filterSpecies.trim()
      })
    };

    activeFilters = newFilters;

    // Reset pagination when filters change.
    void loadCharacters(1, newFilters);
  }

  // Initial loading.
  onMount(() => {
    void loadCharacters();
  });
</script>

<!-- Page metadata -->
<svelte:head>
  <title>Characters | Rick & Morty Explorer</title>
  <meta
    name="description"
    content="Explore and search Rick and Morty characters."
  />
</svelte:head>

<div class="characters-container">

  <!-- Header -->
  <header>
    <h1>Rick & Morty Characters</h1>
    <a href="/">Back to Home</a>
  </header>

  <!-- Filters -->
  <section class="filters">

    <input
      type="text"
      placeholder="Search by name..."
      bind:value={filterName}
    />

    <select bind:value={filterStatus}>
      <option value="">All statuses</option>
      <option value="alive">Alive</option>
      <option value="dead">Dead</option>
      <option value="unknown">Unknown</option>
    </select>

    <input
      type="text"
      placeholder="Search by species..."
      bind:value={filterSpecies}
    />

    <button
      onclick={applyFilters}
      disabled={isLoading}
    >
      Search
    </button>

    <button
      onclick={clearFilters}
      disabled={isLoading}
    >
      Clear
    </button>

  </section>

  <!-- Results -->
  {#if isLoading}

    <p class="loading-message" aria-live="polite">
      Loading characters...
    </p>

  {:else if errorMessage}

    <div class="error-container" role="alert">
      <p class="error">{errorMessage}</p>

      <button onclick={() => void loadCharacters()}>
        Try Again
      </button>
    </div>

  {:else}

    {#if characters.length === 0}

      <div class="empty-results">
        <h2>No characters found</h2>
        <p>Try changing your search filters.</p>
      </div>

    {:else}

      <p class="results-count">
        Found {characters.length} characters
      </p>

      <div class="characters-grid">
        {#each characters as character (character.id)}
          <CharacterCard {character} />
        {/each}
      </div>

    {/if}

    <!-- Pagination -->
    {#if totalPages > 0}

      <div class="pagination">

        <button
          onclick={previousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onclick={nextPage}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </button>

      </div>

    {/if}

  {/if}

</div>

<style>
  .characters-container {
    padding: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  h1 {
    font-size: 2rem;
    font-weight: bold;
  }

  a {
    color: #16a34a;
    text-decoration: none;
  }

  .characters-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(220px, 1fr)
    );
    gap: 24px;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 30px;
  }

  .filters input,
  .filters select {
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
  }

  .filters input {
    flex: 1;
    min-width: 180px;
  }

  button {
    padding: 10px 20px;
    cursor: pointer;
  }

  .filters button {
    border: none;
    border-radius: 6px;
    background-color: #16a34a;
    color: white;
    font-size: 1rem;
  }

  .filters button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-message {
    text-align: center;
    padding: 30px;
  }

  .error-container {
    text-align: center;
    padding: 30px;
  }

  .error {
    color: #dc2626;
    margin-bottom: 15px;
  }

  .empty-results {
    text-align: center;
    padding: 50px 20px;
    color: #6b7280;
  }

  .empty-results h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .results-count {
    margin-bottom: 20px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    margin: 35px 0;
  }

  .pagination button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background-color: #16a34a;
    color: white;
    cursor: pointer;
    font-size: 1rem;
  }

  .pagination button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .pagination span {
    font-weight: bold;
  }

  @media (max-width: 600px) {
    .characters-container {
      padding: 16px;
    }

    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .pagination {
      gap: 12px;
    }
  }
</style>
