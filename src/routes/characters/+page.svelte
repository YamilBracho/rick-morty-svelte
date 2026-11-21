<script lang="ts">
  import { onMount } from 'svelte';

  import CharacterCard from '#lib/components/CharacterCard.svelte';
  import { characterService } from '#lib/services';

  import type { Character } from '#lib/models/Character';

  // $state permite crear variables reactivas.
  // Cuando modificamos una de ellas, Svelte actualiza automáticamente la interfaz.
  let characters = $state<Character[]>([]);
  let isLoading = $state<boolean>(true);
  let errorMessage = $state<string | null>(null);

  let currentPage = $state<number>(1);
  let totalPages = $state<number>(0);

  async function loadCharacters(
    page: number = currentPage
  ): Promise<void> {
    try {
      isLoading = true;
      errorMessage = null;

      const response = await characterService.getCharacters(page);

      characters = response.results;
      totalPages = response.info.pages;
      currentPage = page;

    } catch (error: unknown) {
      errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

   function nextPage(): void {
    if (currentPage < totalPages && !isLoading) {
      void loadCharacters(currentPage + 1);
    }
  }

  function previousPage(): void {
    if (currentPage > 1 && !isLoading) {
      void loadCharacters(currentPage - 1);
    }
  }


  // onMount ejecuta una función cuando el componente se ha montado en el navegador.
  onMount(() => {
    void loadCharacters();
  });
</script>


<!-- Template -->
<svelte:head>
  <title>Characters | Rick & Morty Explorer</title>
</svelte:head>

<div class="characters-container">

  <header>
    <h1>Rick & Morty Characters</h1>
    <a href="/">Back to Home</a>
  </header>

  {#if isLoading}
    <p>Loading characters...</p>

  {:else if errorMessage}
    <p class="error">{errorMessage}</p>

    <button onclick={() => void loadCharacters()}>
      Try Again
    </button>

  {:else}
    <p>Found {characters.length} characters</p>

    <div class="characters-grid">
      {#each characters as character (character.id)}
        <CharacterCard {character} />
      {/each}
    </div>

    <div class="pagination">

      <button
        onclick={previousPage}
        disabled={currentPage === 1 || isLoading}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onclick={nextPage}
        disabled={currentPage === totalPages || isLoading}
      >
        Next
      </button>

    </div>

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

  .error {
    color: #dc2626;
  }

  button {
    padding: 10px 20px;
    cursor: pointer;
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
</style>