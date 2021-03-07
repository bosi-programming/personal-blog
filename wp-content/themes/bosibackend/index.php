<?php

get_header();
?>

<div id="primary" class="content-area">
  <main id="main" class="site-main">
    <div class="row">

      <?php
      if (have_posts()): while (have_posts()): the_post();
      ?>
          <article class="col-4 col article">
            <a href="<?php the_permalink(); ?>">
              <h2 id="logo" class="article-title"><?php the_title(); ?></h2>
            </a>
              <p class="text-lead"><?php the_excerpt(); ?></p>
          </article>

      <?php
        endwhile;
      endif;
      ?>
    </div>
  </main>
</div>

<?php
get_footer();
?>
