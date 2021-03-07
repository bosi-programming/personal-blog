<?php

get_header();
?>

<main class="container">

  <!-- Hero -->
  <?php $hero = get_field('hero'); ?>
  <?php get_template_part('./components/atoms/message', null, array(
    'title' => $hero['title'],
    'text' => $hero['text'],
  )); ?>

  <!-- Social -->
  <?php get_template_part('components/molecules/socialSection'); ?>

  <!-- Main Open Source Projects -->
  <?php $openSource = get_field('open_source'); ?>
  <?php get_template_part('components/molecules/listWithLinks', null, array(
    'title' => $openSource['title'],
    'description' => $openSource['description'],
    'items' => $openSource['items'],
  )); ?>

  <!-- Main Open Source Projects -->
  <?php $workExperience = get_field('work_experience'); ?>
  <?php get_template_part('components/molecules/listWithLinks', null, array(
    'title' => $workExperience['title'],
    'description' => $workExperience['description'],
    'items' => $workExperience['items'],
  )); ?>

<!-- Habilities part -->
  <?php $languages = get_field('languages'); ?>
  <?php $frameworks = get_field('frameworks'); ?>
  <article class="container">
    <div class="lists">
      <h1 class="section-title">Programming Abilities</h1>
      <div class="flex">
        <?php get_template_part('components/molecules/starsList', null, array(
          'title' => $languages['title'],
          'stars' => $languages['languages'],
        )); ?>
        <?php get_template_part('components/molecules/starsList', null, array(
          'title' => $frameworks['title'],
          'stars' => $frameworks['frameworks'],
        )); ?>
      </div>
    </div>
  </article>
</main>

<?php
get_footer();
?>
