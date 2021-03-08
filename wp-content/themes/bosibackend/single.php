<?

get_header();
wp_enqueue_style('single');
wp_enqueue_script('post');
?>

<?php while (have_posts()) : the_post(); ?>
  <?php $postId = get_the_ID(); ?>
  <article id="post-<?php the_ID(); ?>" class="container post">
    <div class="header__container">
      <div class="header__content">
        <?php the_title('<h1 class="post__title">', '</h1>'); ?>

        <p class="p post__date"><?= the_date(); ?> <span class="post-dot">&#183;</span> <span id="time_to_read"></span></p>
      </div>
      <?php the_post_thumbnail('full', ['class' => 'post__image post__thumbnail', 'alt' =>  get_the_title()]); ?>
    </div>

    <div class="post__content">
      <?php the_content(); ?>
    </div>

    <p class="p post__finish-txt">Questions? Comments? Concerns? <a class="link post__link" href="<?= get_site_url() ?>/contact-us">Contact us</a> for more information. We’ll quickly get back to you with the information you need.</p>

    <div class="social-div">
      <div class="meta-div">
      </div>
      <div class="social-wrapper">
        <p class="social__title">Share this:</p>
        <button class="nes-btn" data-show-count="false" onclick="window.open('https://twitter.com/intent/tweet?text=<?php the_title() ?>&url=<?= get_permalink() ?>','name','width=600,height=400')"><i class="fab fa-twitter social__twitter"></i></button>
        <button class="nes-btn" data-show-count="false" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=<?= get_permalink() ?>','name','width=600,height=400')"><i class="fab fa-linkedin-in social__linkedin"></i></button>
      </div>
    </div>

    <div class="yellow-line"></div>
  </article>

  <section class="post__related container">
    <h2 class="blog-section__title">Related Posts</h2>
    <div class="blog-posts__flex">
      <i class="fas fa-chevron-left blog-posts__arrow blog-posts__arrow-left"></i>
      <div id="ajax-posts" class="row blog-posts__wrapper">
        <div class="swiper-wrapper">
          <?php
          global $wp_query;
          $args = array('post_type' => 'post', 'post__not_in' => array($postId));
          $the_query = new WP_Query($args);
          if ($the_query->have_posts()) :
          ?>
            <?php
            /* Start the Loop */
            $i = 1;
            while ($the_query->have_posts()) : $the_query->the_post(); ?>
              <?php $blogPostID = get_the_ID(); ?>
              <?php if ($blogPostID !== $postId) : ?>
                <a class="swiper-slide blog-post link" href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
                  <div class="post_<?= $i ?>">
                    <img class="blog-post__img" src="<?= get_the_post_thumbnail_url() ?>">
                    <p class="p blog-post__date"><?= the_date('M j'); ?> <i class="fas fa-ellipsis-v blog-menu-btn" onclick="postToggle(event, <?= $i ?>);"></i>
                    </p>
                    <h2 class="h2 blog-post__text blog-post__title"><?= the_title() ?></h2>
                    <div class="meta-div">
                    </div>
                  </div>
                </a>
          <?php $i++;
              endif;
            endwhile;
          endif;
          ?>
        </div>
      </div>
      <i class="fas fa-chevron-right blog-posts__arrow blog-posts__arrow-right"></i>
    </div>
  </section>

<?php endwhile; ?>

<?

get_footer();
?>
