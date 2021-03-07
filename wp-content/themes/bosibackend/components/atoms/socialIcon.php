<?php
$args = wp_parse_args(
  $args,
  array(
    'icon' => '',
    'link' => '',
  )
);
?>

<a href="<?= $args['link'] ?>" rel="noopener noreferrer" target="_blank"><i class="nes-icon <?= $args['icon'] ?> is-large" title="<?= $args['icon']; ?>"></i></a>
