<script lang="ts">
  window.onscroll = function () {
    window.scrollTo(0, 0);
  };

  export let category: number | null;
  const handleCategoryChange = (newCategory: number) => {
    category = newCategory;
  };
</script>

<style>
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
  .question {
    margin-bottom: 30px;
  }
  @media (max-width: 767px) {
    .dialog :is(button) {
      font-size: 12px;
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

<div>
  <div class="bg" />
  <dialog class="nes-dialog dialog" id="dialog-default">
    <form method="dialog">
      <p class="title">Hello,</p>
      <p>
        This website has a lot of diversified content. To help you have the best
        experience, I would like to ask you a question first.
      </p>
      <p class="question">On the options bellow, what identify you the best:</p>
      <menu class="dialog-menu menu">
        <button class="nes-btn is-primary">Tech Recruiter</button>
        <button
          class="nes-btn is-primary"
          on:click={() => handleCategoryChange(2)}>Programmer / Tech Fan</button>
        <button class="nes-btn is-primary">Philosopher</button>
        <button class="nes-btn is-primary"  on:click={() => handleCategoryChange(null)}>Curious Person</button>
      </menu>
    </form>
  </dialog>
</div>
