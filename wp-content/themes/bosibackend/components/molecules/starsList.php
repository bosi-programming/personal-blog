<?php
$args = wp_parse_args(
  $args,
  array(
    'title' => '',
    'stars' => array(),
  )
);
?>
<?php wp_enqueue_style('starsList'); ?>

<div class="starList-wrapper">
  <h2 class="title title-starsList"><?= $args['title'] ?></h2>
  <ul class="nes-list is-disc list-starsList">
    <?php foreach ($args['stars'] as $star) {
      if ($star['title']) {
        get_template_part('components/atoms/starItem', null, array(
          'title' => $star['title'],
          'stars' => $star['stars'],
        ));
      }
    } ?>
  </ul>
</div>
