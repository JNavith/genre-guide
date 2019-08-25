<script>
  import NavigationBarTopLevel from "../components/NavigationBarTopLevel.svelte";

  export let segment;
</script>

<div
  class={'h-1 ' + (segment !== 'about' ? 'theme-light:bg-green-500 theme-dark:bg-green-400' : 'bg-google-sheets')} />

<NavigationBarTopLevel {segment} />

<main class="flex-1 flex flex-col">
  <slot />
</main>

{#if segment !== 'about'}
  <div class="h-1 theme-light:bg-green-500 theme-dark:bg-green-400" />
{/if}
