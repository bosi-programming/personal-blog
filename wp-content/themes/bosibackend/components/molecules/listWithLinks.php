<?php
$args = wp_parse_args(
  $args,
  array(
    'title' => '',
    'description' => '',
    'items' => array(),
  )
);
?>
<?php wp_enqueue_style('listWithLinks'); ?>

<div class="lists lists-withLinks">
  <h1 class="title title-withLinks"><?= $args['title'] ?></h1>
  <p class="description description-withLinks"><?= $args['description'] ?></p>
  <ul class="nes-list is-circle list list-withLinks">
    <?php foreach ($args['items'] as $item) {
      if ($item['title']) {
        get_template_part('components/atoms/itemWithDescription', null, array(
          'title' => $item['title'],
          'link' => $item['link'],
          'description' => $item['description'],
        ));
      }
    } ?>
  </ul>
</div>
