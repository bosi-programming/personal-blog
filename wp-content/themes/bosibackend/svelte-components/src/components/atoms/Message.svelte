<script lang="ts">
  export let title: string;
  export let text: string;
</script>

<style>
  .message__title,
  .message__text {
    font-family: "Press Start 2P", cursive;
    font-size: 16px;
    font-weight: 400;
  }
  .message__text {
    text-align: left;
  }
  @media (min-width: 768px) {
    .message__title {
      font-size: 24px !important;
    }
  }
</style>

<div class="nes-container is-dark message {title && 'with-title'}">
  <p class="title message__title">{title}</p>
  <p class="message__text">{text}</p>
</div>
