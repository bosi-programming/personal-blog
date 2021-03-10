<?php
$args = wp_parse_args(
  $args,
  array(
    'title' => '',
    'text' => '',
  )
);
?>
<?php wp_enqueue_style('message'); ?>

<div class="nes-container is-dark message <?= !empty($args['title']) ? 'with-title' : '' ?>">
  <?php if ($args['title']) : ?>
    <p class="title message__title"><?= $args['title'] ?></p>
  <?php endif; ?>
  <p class="message__text"><?= $args['text'] ?></p>
</div>
