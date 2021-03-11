<script lang="ts">
  import ItemWithDescription from "../atoms/ItemWithDescription.svelte";
  import type { itemProps } from "../atoms/ItemWithDescription.type";

  export let title: string;
  export let description: string;
  export let items: itemProps[];
</script>

<style>
  .lists {
    margin: 30px 0;
  }
  .list {
    margin-left: 15px;
  }
  .title {
    padding-bottom: 30px;
  }
  .description {
    text-align: center;
    padding-bottom: 15px;
  }
  @media (min-width: 768px) {
    .lists {
      margin: 45px 0;
    }
    .description {
      text-align: left;
    }
  }
</style>

<div class="lists">
  <h1 class="title">{title}</h1>
  <p class="description">{description}</p>
  <ul class="nes-list is-circle list">
    {#each items as item, i (`${i}-${item.title}`)}
      <ItemWithDescription {item} />
    {/each}
  </ul>
</div>
