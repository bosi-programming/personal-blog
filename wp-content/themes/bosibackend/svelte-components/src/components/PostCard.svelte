<script lang="ts">
  import type { article } from './article.type';

  export let item: article;

  const renderHtml = (html: string) => {
    const stringWithoutTags = html.replace(/<[^>]*>?/gm, '');
    const stringWithCorrectChars = stringWithoutTags.replace('&#8230;', '...');
    const stringWithCorrectAposte = stringWithCorrectChars.replace('&#8217;', '\'');
    return stringWithCorrectAposte;
  }

  const handleDate = (dateString: Date) => {
    const date = new Date(dateString);
    const dateOptions = {
      day: 'numeric',
      month: 'short',
    }

    return date.toLocaleString('en-us', dateOptions);
  }
</script>

<style>
  .post-card {
    width: 300px;
    height: 470px;
    padding: 24px !important;
  }

  .post-card:hover {
    transform: scale(1.2);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 432px;
    justify-content: space-between;
  }

  .card-text {
    color: #212529;
  }
</style>

<article class="swiper-slide nes-container is-rounded post-card slide">
  <a
    class="card-content"
    href={item.link}
    rel="bookmark"
    title="Permanent Link to {item.title.rendered}">
    <h3>{item.title.rendered}</h3>
    <p class="card-text">{renderHtml(item.excerpt.rendered)}</p>
    <p class="card-text">{handleDate(item.date)}</p>
  </a>
</article>
