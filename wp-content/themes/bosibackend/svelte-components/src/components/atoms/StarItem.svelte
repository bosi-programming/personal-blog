<script lang="ts">
  export let title: string;
  export let stars: number;

  const starsArray: string[] = [];

  for (let i = 0; i < 5; i++) {
    if (i < Math.floor(stars)) {
      starsArray.push("star");
    } else if (i === Math.floor(stars) && stars.toString().slice(-1) === "5") {
      starsArray.push("star is-half");
    } else {
      starsArray.push("star is-transparent");
    }
  }
</script>

<style>
  .icon {
    width: 12px;
    height: 12px;
    margin-right: 20px;
  }
  .flex {
    align-items: center;
  }
  .title {
    margin-bottom: 0;
    margin-right: 10px;
  }
  .item {
    margin-bottom: 10px;
  }
  @media (max-width: 768px) {
    .icon {
      width: 8px;
      height: 8px;
      margin-right: 12px;
      transform: scale(1.5);
    }
    .title {
      font-size: 12px;
    }
  }
</style>

<li class="item flex">
  <h3 class="title">{title}</h3>
  <div class="stars__div">
    {#each starsArray as star}<i class="nes-icon {star} icon" />{/each}
  </div>
</li>
