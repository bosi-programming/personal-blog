<script lang="ts">
  import { onMount } from "svelte";

  import type { article } from "../components/article.type";
  import Dialog from "../components/Dialog.svelte";
  import PostsWrapper from "../components/PostsWrapper.svelte";

  const url = process.env.wordpressRestUrl;
  const fields = ["link", "title", "date", "excerpt"];
  const status = ["publish"];
  const categoryFromLocalStorage = window.localStorage.getItem("category");

  let articles: article[] = [];

  const fetchArticles = async (
    category: number | string | null = undefined
  ) => {
    if (articles.length !== 0) {
      articles = [];
    }
    if (category) {
      window.localStorage.setItem("category", category.toString());
    }
    const selectedCategory = categoryFromLocalStorage || category;
    const response = await fetch(
      `${url}/posts?status=${status.toString()}&_fields=${fields.toString()}${
        selectedCategory ? `&categories=${selectedCategory}` : ""
      }`
    );
    articles = await response.json();
  };

  onMount(async () => {
    fetchArticles();
  });
</script>

<style>
</style>

<div class="container">
  {#if !categoryFromLocalStorage || categoryFromLocalStorage === ''}
    <Dialog changeCategory={fetchArticles} />
  {/if}
  <PostsWrapper {articles} />
</div>
