<script lang="ts">
  import type { article } from "./article.type";
  import Loader from "./Loader.svelte";
  import PostCard from "./PostCard.svelte";

  export let articles: article[] = [];
</script>

{#if articles && articles.length > 0}
  <div class="posts-wrapper">
    {#each articles as article}
      <PostCard item={article} />
    {/each}
  </div>
{:else}
  <div class="flex-center">
    <Loader />
  </div>
{/if}

<style>
  .flex-center {
    display: flex;
    height: 75vh;
    width: 100%;
    align-items: center;
    justify-content: center;
  }
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
