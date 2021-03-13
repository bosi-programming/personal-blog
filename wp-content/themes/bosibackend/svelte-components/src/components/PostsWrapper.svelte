<script lang="ts">
  import type { article } from "./article.type";
  import PostCard from "./PostCard.svelte";

  export let articles: article[] = [];
</script>

<style>
  .posts-wrapper {
    margin-top: 45px;
  }

  .posts-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 45px;
  }

  @media (min-width: 768px) {
    .posts-wrapper {
      margin-top: 80px;
    }
    .posts-wrapper {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 1200px) {
    .posts-wrapper {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
</style>

<div class="posts-wrapper">
  {#each articles as article}
    <PostCard item={article} />
  {:else}
    <p>Loading...</p>
  {/each}
</div>
