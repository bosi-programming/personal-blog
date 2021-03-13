<script lang="ts">
  import { onMount } from "svelte";

  import type { article } from "../components/article.type";
  import Dialog from "../components/Dialog.svelte";
  import PostsWrapper from "../components/PostsWrapper.svelte";

  const url = process.env.wordpressRestUrl;
  const fields = ["link", "title", "date", "excerpt"];
  const status = ["publish"];

  let articles: article[] = [];

  const fetchArticles = async (category: number | null = null) => {
    if (articles.length !== 0) {
      articles = [];
    }
    const response = await fetch(
      `${url}/posts?status=${status.toString()}&_fields=${fields.toString()}${
        category ? `&categories=${category}` : ""
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
  <Dialog changeCategory={fetchArticles} />
  <PostsWrapper {articles} />
</div>
