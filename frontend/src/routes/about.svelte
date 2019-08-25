<script>
  import { onMount, onDestroy } from "svelte";
  import { sineIn, sineOut } from "svelte/easing";
  import { siteName } from "../stores";
  import { fadeSlide } from "../transitions.js";
  import tailwindConfig from "../../tailwind.config.js";

  // Hack to make transitions work on initial page load
  let shown = false;
  onMount(() => (shown = true));
  onDestroy(() => (shown = false));

  let technologies = [
    {
      title: "The Genre Sheet",
      descriptionHtml: `All subgenre identifications and history come from years of work by the team working on the <a href="https://docs.google.com/spreadsheets/d/1xZUWWnll7HzDVmNj_W7cBfz9TTkl-fMMqHZ8derG-Dg" class="font-medium hover:text-var-foreground-accent">Genre Sheet</a>, a publicly accessible Google Sheets spreadsheet.`,
      colorBackground: tailwindConfig.theme.extend.colors["google-sheets"],
      colorForeground: "#E8FFF9",
      colorForegroundAccent: "#FFFFFF",
      image: "/img/sheets.svg"
    },
    {
      title: "Feather Icons",
      descriptionHtml: `We use icons from the <a href="https://feathericons.com/" class="font-medium hover:text-var-foreground-accent">Feather</a> pack (through <a href="https://npmjs.com/package/svelte-feather-icons" class="font-medium hover:text-var-foreground-accent">this Svelte library</a>) in a few places, like subgenre operators and for the settings menu.`,
      colorBackground: "#0066FF",
      colorForeground: "#C2F0FF",
      colorForegroundAccent: "#FFFFFF",
      image: "/img/feather.svg"
    },
    {
      title: "Discord",
      descriptionHtml: `Join us in discussion about ${$siteName} and the Genre Sheet on <a href="https://discord.gg/z5W6Cpd" class="font-medium hover:text-var-foreground-accent">our Discord server</a>.`,
      colorBackground: "#7289DA",
      colorForeground: "#EBF5FF",
      colorForegroundAccent: "#FFFFFF",
      image: "/img/discord.svg"
    },
    {
      title: "GraphQL",
      descriptionHtml: `${$siteName}’s API is available over the GraphQL query language at <a href="/graphql" class="font-medium hover:text-var-foreground-accent">this endpoint</a>. <br /> Opening this link in the browser will bring you to the GraphiQL playground, where you can explore the schema and experiment building queries with autocompletion.`,
      colorBackground: "#E535AB",
      colorForeground: "#FDDFFF",
      colorForegroundAccent: "#FFFFFF",
      image: "/img/graphql.svg"
    },
    {
      title: "Svelte",
      descriptionHtml: `The frontend, which you're enjoying right now, has been rewritten from Jinja to Vue to <a href="https://svelte.dev/" class="font-medium hover:text-var-foreground-accent">Svelte</a> (with <a href="https://sapper.svelte.dev/" class="font-medium hover:text-var-foreground-accent">Sapper</a>) across its lifetime.`,
      colorBackground: "#FF3E00",
      colorForeground: "#FFF0C8",
      colorForegroundAccent: "#FFFFFF",
      image: "/img/svelte.svg"
    },
    {
      title: "GitHub",
      descriptionHtml: `The code that powers ${$siteName} is available in a <a href="https://github.com/SirNavith/genre.guide" class="font-medium hover:text-var-foreground-accent">GitHub repository</a>, where contributions are welcome! It’s also AGPL (Affero General Public License) 3 licensed, with modification instructions provided in the README.`,
      colorBackground: "#DCEEFE",
      colorForeground: "#3D4852",
      colorForegroundAccent: "#22292F",
      image: "/img/github.svg"
    }
  ];
</script>

<svelte:head>
  <title>How we make {$siteName}</title>
</svelte:head>

<ul class="flex flex-col flex-1 selection:bg-white selection:text-green">
  {#each technologies as { title, descriptionHtml, colorBackground, colorForeground, colorForegroundAccent, image }, index}
    <li
      in:fadeSlide={{ delay: Math.sqrt(index) * 100, opacityDuration: 250, opacityEasing: sineIn, translateYPercent: -200, transformDuration: 120, transformEasing: sineOut }}
      out:fadeSlide={{ delay: Math.sqrt(technologies.length - 1 - index) * 100, opacityDuration: 250, opacityEasing: sineOut, translateYPercent: -100, transformDuration: 120, transformEasing: sineOut }}
      class="w-full flex flex-1 justify-center bg-var-background"
      style={`--color-background: ${colorBackground}; --color-foreground: ${colorForeground}; --color-foreground-accent: ${colorForegroundAccent}; --image-background: url(${image})`}>
      <div class="max-w-5xl flex flex-1 p-8">
        <div
          class="w-32 h-32 flex-shrink-0 bg-var-background-image bg-center
          bg-contain bg-no-repeat" />
        <div class="ml-10">
          <h1
            class="font-heading font-normal text-3xl table border-b-4 mb-4
            text-var-foreground-accent">
            {title}
          </h1>
          <p
            class="font-body font-light text-xl leading-loose
            text-var-foreground">
            {@html descriptionHtml}
          </p>
        </div>
      </div>
    </li>
  {/each}
</ul>
