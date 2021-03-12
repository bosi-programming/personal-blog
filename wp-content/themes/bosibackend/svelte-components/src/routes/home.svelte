<script lang="ts">
  import { onMount } from "svelte";

  import type { category } from '../components/category.type';
  import Dialog from "../components/Dialog.svelte";
  import PostsWrapper from '../components/PostsWrapper.svelte';

  const url = process.env.wordpressRestUrl;
  const fields = ["link", "title", "date", "excerpt"];

  let selectedCategory: number | null;
  let categories : category[] = [];

  const fetchCategories = async () => {
    const response = await fetch(
      `${url}/categories?_fields=${fields.toString()}`    );
    categories = await response.json();
  };

  onMount(() => fetchCategories());
</script>

<style>
</style>

<div class="container">
  <Dialog bind:category={selectedCategory} />
  <PostsWrapper category={selectedCategory} />
</div>
