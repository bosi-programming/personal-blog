<?
wp_enqueue_style('post-card');
?>
<article class="swiper-slide nes-container is-rounded post-card slide">
  <a class="card-content" href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
    <h3><?= the_title() ?></h3>
    <p class="card-text"><?= get_the_excerpt(); ?></p>
    <p class="card-text"><?= get_the_date('M j'); ?></p>
  </a>
</article>
