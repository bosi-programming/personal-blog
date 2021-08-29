<script lang="ts">
  import { onMount } from "svelte";

  import type { category } from "./category.type";

  type backend = {
    id: number;
    name: string;
  };

  window.onscroll = function () {
    window.scrollTo(0, 0);
  };

  export let changeCategory: (category: number | string | null) => void;
  let categories: category[] = [];
  let isToHide = false;

  const url = process.env.wordpressRestUrl;
  const fields = ["id", "name"];

  const fetchCategories = async () => {
    const response = await fetch(
      `${url}/categories?_fields=${fields.toString()}`
    );
    const responseJson = await response.json();
    responseJson.forEach((el: backend) => {
      const categoryName = el.name;
      categories[categoryName] = el.id;
    });
  };

  onMount(() => fetchCategories());

  const hideDialog = () => {
    isToHide = true;
    window.onscroll = null;
  };

  const handleCategoryChange = (newCategory: number | string) => {
    changeCategory(newCategory);
    hideDialog();
  };
</script>

<div class:hide={isToHide}>
  <div class="bg" on:click={() => hideDialog()} />
  <dialog class="nes-dialog dialog" id="dialog-default">
    <form method="dialog">
      <p class="title">Hello,</p>
      <p>
        To help you have the best experience, I would like to ask you a question
        first. On the options bellow, what identify you the best:
      </p>
      <menu class="dialog-menu menu">
        <button
          class="nes-btn is-primary"
          on:click={() =>
            handleCategoryChange(categories["Programming"] || null)}
          >Tech Recruiter</button
        >
        <button
          class="nes-btn is-primary"
          on:click={() =>
            handleCategoryChange(categories["Programming"] || null)}
          >Programmer</button
        >
        <button
          class="nes-btn is-primary"
          on:click={() =>
            handleCategoryChange(categories["Philosophy"] || null)}
          >Philosopher</button
        >
        <button
          class="nes-btn is-primary"
          on:click={() =>
            handleCategoryChange(
              [
                categories["Philosophy"],
                categories["Programming"],
              ].toString() || null
            )}>Curious Person</button
        >
      </menu>
    </form>
  </dialog>
</div>

<style>
  .hide {
    display: none !important;
  }
  .dialog {
    display: block;
    position: absolute;
    top: 50%;
    transform: translatey(-50%);
    z-index: 9999;
    max-width: 80vw;
  }
  .menu {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .bg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.66);
  }
  @media (max-width: 767px) {
    .dialog :is(button) {
      font-size: 10px;
    }
    .dialog :is(p) {
      font-size: 16px;
    }
  }
  @media (min-width: 768px) {
    .menu {
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  }
  @media (min-width: 1024px) {
    .dialog {
      max-width: 50vw;
    }
  }
</style>
