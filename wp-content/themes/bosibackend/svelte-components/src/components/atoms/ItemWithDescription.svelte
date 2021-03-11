<script lang="ts">
  import type { itemProps } from './ItemWithDescription.type'; 

  export let item: itemProps;
</script>

<style>
  .point {
    text-align: left;
  }
  .link {
    color: #42b983;
  }
  .link:hover {
    color: #357a5a;
    text-decoration: none;
  }
</style>

<li class="point">
  <a class="link" href={item.link} target="_blank" rel="noopener noreferrer">
    {item.title}
  </a>
  <p>{item.description}</p>
</li>
