<script>
  import { scale } from "svelte/transition";
  import { siteName } from "../stores.js";
  import SettingsTopLevel from "./SettingsTopLevel.svelte";

  export let segment;

  $: destinations = [
    { name: "catalog", route: "/catalog", title: "Track catalog" },
    { name: "about", route: "/about", title: "About " + $siteName }
  ];
</script>

<nav
  class={'flex justify-between items-center py-3 sm:py-4 md:py-6 ' + (segment !== 'about' ? '' : 'bg-google-sheets')}>
  <!-- Left side: main site name -->
  <div class="mr-2">
    <a
      class={'block ml-3 sm:ml-4 md:ml-6 text-lg sm:text-xl md:text-2xl font-heading font-medium ' + (segment !== 'about' ? 'theme-light:text-green-500 theme-light:hover:text-green-600 theme-dark:text-green-400 theme-dark:hover:text-green-300' : 'text-white')}
      href="/"
      title={$siteName + ' homepage'}>
      {#if segment === 'about'}
        <span class="opacity-75">how we make</span>
      {/if}
      <span>{$siteName}</span>
      {#if segment !== 'about'}
        <span class="opacity-50">(alpha)</span>
      {/if}
    </a>
  </div>

  <!-- Right side -->
  <div class="ml-2 flex items-center">
    {#each destinations as { name, route, title }}
      <a
        class={'block mr-3 sm:mr-4 md:mr-6 text-md sm:text-lg md:text-xl font-heading ' + (segment !== 'about' ? 'theme-light:text-green-500 theme-light:hover:text-green-600 theme-dark:text-green-400 theme-dark:hover:text-green-300' : 'text-white')}
        href={route}
        {title}>
        {name}
      </a>
    {/each}

    <div class="relative">
      <SettingsTopLevel {segment} />
    </div>
  </div>
</nav>
