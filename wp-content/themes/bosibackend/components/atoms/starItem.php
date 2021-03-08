<?php
$args = wp_parse_args(
  $args,
  array(
    'title' => '',
    'stars' => 0,
  )
);

$starsArray = array();

for ($i = 1; $i <= 5; $i++) {
  if ($i <= round($args['stars']) && $i <= floatval($args['stars'])) {
    array_push($starsArray, "star");
  } else if ($i == round($args['stars']) && $i > floatval($args['stars'])) {
    array_push($starsArray, "star is-half");
  } else {
    array_push($starsArray, "star is-transparent");
  }
}
?>
<?php wp_enqueue_style('starItem'); ?>

<li class="item item-star flex flex-star">
  <p class="title title-star"><?= $args['title'] ?></p>
  <div class="stars__div">
    <?php foreach ($starsArray as $star) : ?>
      <i class="nes-icon <?= $star ?> icon icon-star"></i>
    <?php endforeach; ?>
  </div>
</li>
