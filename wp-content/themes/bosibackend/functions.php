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
    'fontawesome',
    get_template_directory_uri() . '/assets/css/all.min.css',
    array(),
    '2.0',
  );

  wp_enqueue_style('fontawesome');
}
add_action('get_header', 'cssGlobals', 99);

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
  'socialSection',
  get_template_directory_uri() . '/components/molecules/socialSection.css',
  array(),
  '1.0',
);

wp_register_style(
  'starItem',
  get_template_directory_uri() . '/components/atoms/starItem.css',
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
  'single',
  get_template_directory_uri() . '/single.css',
  array(),
  '1.0',
);

wp_register_style(
  'header',
  get_template_directory_uri() . '/organisms/header.css',
  array(),
  '1.0',
);
