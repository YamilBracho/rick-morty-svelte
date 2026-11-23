<!-- 
  Pagina principal del Catalogo de Rick and Morty

  Yamil Bracho
  2026-Nov-11 
-->

<script lang="ts">
  import rickMortyLogo from '#lib/assets/rick-morty-logo.jpg';

  let appTitle: string = 'Rick & Morty Explorer';

  function searchCharacters(): void {
    window.location.href = '/characters';
  }
</script>

<!-- Permite establecer información del documento HTML, como el título 
 de la pestaña del navegador. -->
<svelte:head>
  <title>{appTitle}</title>
  <meta
    name="description"
    content="Explore the Rick and Morty universe"
  />
</svelte:head>

<div class="home-container">
  <h1>{appTitle}</h1>

  <img src={rickMortyLogo} alt="logo" />

  <p>
    Explore the universe of Rick and Morty
  </p>

  <!-- Eventos : onNombreEvento -->
  <button onclick={searchCharacters}>
    Search Characters
  </button>
</div>

<!-- El bloque <style> contiene CSS encapsulado para este componente. -->
<style>
  .home-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    text-align: center;
    background-color: #f0fdf4;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #166534;
  }

  p {
    font-size: 1.2rem;
    color: #374151;
  }

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background-color: #16a34a;
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #15803d;
  }

.home-container img {
    width: 300px;
    height: auto;
    object-fit: contain;
}


</style>
