<script>
  export let status;
  export let error;

  export let title = error.message;

  const dev = process.env.NODE_ENV === "development";
</script>

<div class="flex-1 flex flex-col items-center justify-center text-center">
  <h1
    class="font-medium font-heading text-4xl sm:text-6xl md:text-8xl
    theme-light:text-green-700 theme-dark:text-green-300 uppercase">
    {error.message}
  </h1>
  <p
    class="font-medium text-3xl sm:text-5xl md:text-7xl
    theme-light:text-green-600 theme-dark:text-green-400">
    {status}
  </p>

  <a
    class="mt-16 text-xl sm:text-2xl md:text-3xl theme-light:text-green-400
    theme-light:hover:text-green-500 theme-dark:text-green-600
    theme-dark:hover:text-green-500"
    href="/">
    return to the homepage
  </a>
</div>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
