<?php

/**
 * Bosi Backend functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package BosiBackend
 * @since 1.0
 */
function top_menu()
{
  register_nav_menu('top-menu', __('Top Menu'));
}
add_action('init', 'top_menu');

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
  'header',
  get_template_directory_uri() . '/organisms/header.css',
  array(),
  '1.0',
);
