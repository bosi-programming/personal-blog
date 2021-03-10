<?

get_header();
wp_enqueue_style('category');
wp_enqueue_script('category');
?>
<main class="container">

  <h1><?= single_cat_title('', false); ?></h1>
  <div class="wrapper">
    <?php
    $category = get_the_category();
    $category_description = $category[0]->category_description;
    if ($category_description) : ?>
      <?php get_template_part('./components/atoms/message', null, array(
        'text' => $category_description,
      )); ?>
    <?php endif; ?>
  </div>

  <div class="posts-wrapper">
    <?php
    if (have_posts()) : while (have_posts()) : the_post();
    ?>
        <?php get_template_part('./components/molecules/post-card'); ?>
    <?php
      endwhile;
    endif;
    ?>
  </div>
</main>

<?

get_footer();
?>
