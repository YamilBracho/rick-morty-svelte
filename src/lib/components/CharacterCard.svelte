<script lang="ts">
   import type { Character } from '#lib/models/Character';

  let { character }: { character: Character } = $props();
</script>

<div class="character-card">
  <img
    src={character.image}
    alt={character.name}
  />

  <div class="character-info">
    <h2>{character.name}</h2>

    <p>
      <strong>Status:</strong> {character.status}
    </p>

    <p>
      <strong>Species:</strong> {character.species}
    </p>

    <p>
      <strong>Gender:</strong> {character.gender}
    </p>
  </div>
</div>

<style>
  .character-card {
    border: 1px solid #d1d5db;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    display: block;
  }

  .character-info {
    padding: 16px;
  }

  h2 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 12px;
  }

  p {
    margin: 6px 0;
    color: #374151;
  }
</style>