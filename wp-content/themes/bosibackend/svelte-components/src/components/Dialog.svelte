<script lang="ts">
  window.onscroll = function () { window.scrollTo(0, 0); };
</script>

<style>
  .dialog {
    display: block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9999;
    max-width: 50vw;
  }
  .menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
</style>

<div>
  <div class="bg"></div>
  <dialog class="nes-dialog dialog" id="dialog-default">
    <form method="dialog">
      <p class="title">Hello,</p>
      <p>
        This website has a lot of diversified content. To help you have the best
        experience, I would like to ask you a question first. On the options
        bellow, what identify you the best:
      </p>
      <menu class="dialog-menu menu">
        <button class="nes-btn is-primary">Tech Recruiter</button>
        <button class="nes-btn is-primary">Programmer / Tech Fan</button>
        <button class="nes-btn is-primary">Philosopher</button>
        <button class="nes-btn is-primary">Curious Person</button>
      </menu>
    </form>
  </dialog>
</div>
