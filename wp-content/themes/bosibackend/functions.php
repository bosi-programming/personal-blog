<?php

/**
 * Bosi Backend functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package BosiBackend
 * @since 1.0
 */
function init_theme()
{
  register_nav_menu('top-menu', __('Top Menu'));
  add_theme_support('editor-styles');
  add_editor_style('assets/css/nes.min.css');
  add_editor_style('assets/css/editor.css');
  add_editor_style('https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap');
}
add_action('init', 'init_theme');

/**
 * Filter the except length to 30 words.
 *
 * @param int $length Excerpt length.
 * @return int (Maybe) modified excerpt length.
 */
function wpdocs_custom_excerpt_length($length)
{
  return 20;
}
add_filter('excerpt_length', 'wpdocs_custom_excerpt_length', 999);

/**
 * Filter the "read more" excerpt string link to the post.
 *
 * @param string $more "[..]" excerpt string.
 * @return string "..." instead.
 */
function wpdocs_excerpt_more($more)
{
  return ' ...';
}
add_filter('excerpt_more', 'wpdocs_excerpt_more');

// Adding stylesheets

function cssGlobals()
{
  wp_register_style(
    'nes',
    get_template_directory_uri() . '/assets/css/nes.min.css',
    array(),
    '2.0',
  );

  wp_enqueue_style('nes');

  wp_register_style(
    'global',
    get_template_directory_uri() . '/assets/css/global.css',
    array(),
    '2.0',
  );

  wp_enqueue_style('global');

  wp_register_style(
    'header',
    get_template_directory_uri() . '/header.css',
    array(),
    '1.0',
  );

  wp_enqueue_style('header');

  wp_register_style(
    'footer',
    get_template_directory_uri() . '/footer.css',
    array(),
    '1.0',
  );

  wp_enqueue_style('footer');

  wp_register_style(
    'fontawesome',
    get_template_directory_uri() . '/assets/css/all.min.css',
    array(),
    '2.0',
  );

  wp_enqueue_style('fontawesome');
}
add_action('get_header', 'cssGlobals', 99);

// vendor files
wp_register_style(
  'swiper',
  get_template_directory_uri() . '/assets/css/swipper.min.css',
  array(),
  '1.0',
);

wp_register_script(
  'swiper',
  get_template_directory_uri() . '/assets/js/swipper.min.js',
  '',
  '1.0',
  true,
);


// Add single css files
wp_register_style(
  'itemWithDescription',
  get_template_directory_uri() . '/components/atoms/itemWithDescription.css',
  array(),
  '1.0',
);

wp_register_style(
  'message',
  get_template_directory_uri() . '/components/atoms/message.css',
  array(),
  '1.0',
);

wp_register_style(
  'starItem',
  get_template_directory_uri() . '/components/atoms/starItem.css',
  array(),
  '1.0',
);

// Molecules styles

wp_register_style(
  'socialSection',
  get_template_directory_uri() . '/components/molecules/socialSection.css',
  array(),
  '1.0',
);


wp_register_style(
  'listWithLinks',
  get_template_directory_uri() . '/components/molecules/listWithLinks.css',
  array(),
  '1.0',
);

wp_register_style(
  'starsList',
  get_template_directory_uri() . '/components/molecules/starsList.css',
  array(),
  '1.0',
);

wp_register_style(
  'post-card',
  get_template_directory_uri() . '/components/molecules/post-card.css',
  array(),
  '1.0',
);

// Pages styles

wp_register_style(
  'single',
  get_template_directory_uri() . '/single.css',
  array(),
  '1.0',
);

wp_register_script(
  'single',
  get_template_directory_uri() . '/single.js',
  array(),
  '1.0',
);

wp_register_style(
  'highlight',
  get_template_directory_uri() . '/assets/highlight/styles/gruvbox-dark.css',
  array(),
  '1.0',
);
wp_register_script(
  'highlight',
  get_template_directory_uri() . '/assets/highlight/highlight.pack.js',
  array(),
  '1.0',
);

wp_register_style(
  'category',
  get_template_directory_uri() . '/category.css',
  array(),
  '1.0',
);

wp_register_script(
  'category',
  get_template_directory_uri() . '/category.js',
  array(),
  '1.0',
);

wp_register_style(
  'svelte',
  get_template_directory_uri() . '/svelte-components/public/build/bundle.css',
  array(),
  '1.0',
);

wp_register_script(
  'svelte',
  get_template_directory_uri() . '/svelte-components/public/build/bundle.js',
  array(),
  '1.0',
);
