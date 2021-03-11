<script lang="ts">
  import Message from "../components/atoms/Message.svelte";
  import SocialSection from "../components/atoms/SocialSection.svelte";
  import ListWithLinks from "../components/molecules/ListWithLinks.svelte";
  import StarsList from "../components/molecules/StarsList.svelte";
  import Dialog from "../components/Dialog.svelte";
  import type { itemProps } from "../components/atoms/ItemWithDescription.type";
  import type { starType } from "../components/molecules/StarsList.type";

  const openSourceItems: itemProps[] = [
    {
      title: "StartPage",
      link: "https://github.com/bosifullstack/startpage",
      description: "A PWA StartPage made with svelte",
    },
    {
      title: "React FakeStore",
      link: "https://bosifullstack.github.io/fakeStore/",
      description: "A fake store website made with React and Redux",
    },
    {
      title: "Get Stock",
      link: "https://github.com/bosifullstack/cotacoes",
      description: "A website that get data of a stock from an API",
    },
    {
      title: "To-Do CLI",
      link: "https://github.com/bosifullstack/ToDo-CLI",
      description: "A ToDo list CLI app made with Node.js",
    },
  ];
  const workExperiencesItems: itemProps[] = [
    {
      title: "Luma Health",
      link: "https://www.lumahealth.io/",
      description:
        "Main developer of the blog and part of the frontend team responsible from the company's app. The blog is made in Wordpress and the app is in React",
    },
    {
      title: "UVV",
      link: "https://www.uvv.br/",
      description:
        "Part of the front-end team responsible to maintain the site running",
    },
    {
      title: "Phidelis",
      link: "https://phidelis.com.br/",
      description:
        "Part of the front-end/design team. Responsable for the implementation of Vue.js and Nuxt.js on the product.",
    },
    {
      title: "Foca Enem",
      link: "https://focaenem.folhavitoria.com.br/",
      description:
        "Part of the front-end/design team responsable refactor all of the product",
    },
  ];

  const programmingLanguages: starType[] = [
    {
      title: "Java",
      stars: 3,
    },
    {
      title: "NodeJs",
      stars: 3,
    },
    {
      title: "JavaScript",
      stars: 5,
    },
    {
      title: "TypeScript",
      stars: 4,
    },
    {
      title: "PHP",
      stars: 2,
    },
  ];

  const frameworks: starType[] = [
    {
      title: "Spring Boot",
      stars: 3,
    },
    {
      title: "ExpressJs",
      stars: 3,
    },
    {
      title: "SvelteJs",
      stars: 4,
    },
    {
      title: "React",
      stars: 4,
    },
  ];
</script>

<style>
  .section-title {
    margin-bottom: 1.5em;
  }
  @media (max-width: 768px) {
    .flex {
      flex-wrap: wrap;
    }
  }
</style>

<div class="container">
  <Dialog />
  <Message
    title={'Felipe Azevedo Bosi'}
    text={'Frontend developer specialized in solutions for educational and health care systems.'} />
  <SocialSection />
  <ListWithLinks
    title="Main open-source projects"
    description="Here are my main open-source projects. You can see the rest of them on my GitHub account."
    items={openSourceItems} />
  <ListWithLinks
    title="Work experiences"
    description="Here you can see some of the private projects that I made or participate on the main developer team."
    items={workExperiencesItems} />

  <article class="container">
    <div class="lists">
      <h1 class="section-title">Programming Abilities</h1>
      <div class="flex">
        <StarsList title="Programming Languages" stars={programmingLanguages} />
        <StarsList title="Frameworks" stars={frameworks} />
      </div>
    </div>
  </article>
</div>
