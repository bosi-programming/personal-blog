<script lang="ts">
  import StarItem from "../atoms/StarItem.svelte";
  import type { starType } from "./StarsList.type";

  export let title: string;
  export let stars: starType[];
</script>

<style>
  .nes-list {
    padding-left: 20px;
  }
  .title {
    font-size: 1.3em;
    margin-bottom: 1.3em;
  }
  @media (max-width: 768px) {
    .nes-list {
      width: 86vw;
    }
  }
</style>

<div>
  <h2 class="title">{title}</h2>
  <ul class="nes-list is-disc">
    {#each stars as star}
      <StarItem title={star.title} stars={star.stars} />
    {/each}
  </ul>
</div>
