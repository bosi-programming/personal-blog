<?php
$args = wp_parse_args(
  $args,
  array(
    'title' => '',
    'link' => '',
    'description' => '',
  )
);
?>
<?php wp_enqueue_style('itemWithDescription'); ?>

<li class="point">
  <a class="link" href="<?= $args['link'] ?>" target="_blank" rel="noopener noreferrer">
    <?= $args['title'] ?>
  </a>
  <p><?= $args['description'] ?></p>
</li>
