<script lang="ts">
  import { onMount, beforeUpdate } from "svelte";

  import type { article } from "./article.type";
  import PostCard from "./PostCard.svelte";

  const url = process.env.wordpressRestUrl;
  const fields = ["link", "title", "date", "excerpt"];
  const status = ["publish"];

  export let category: number | null;
  let articles: article[] = [];

  const fetchArticles = async () => {
    const response = await fetch(
      `${url}/posts?status=${status.toString()}&_fields=${fields.toString()}${
        category ? `&categories=${category}` : ""
      }`
    );
    articles = await response.json();
  };

  onMount(() => fetchArticles());
  beforeUpdate(() => fetchArticles());
</script>

<style>
  .post-card {
    width: initial !important;
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

<div class="posts-wrapper">
  {#each articles as article}
    <PostCard item={article} />
  {:else}
    <p>Loading...</p>
  {/each}
</div>
