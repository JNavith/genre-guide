<script lang="typescript">
  // @ts-ignore
  import Metadata from "../components/Renderless/Metadata.svelte";
  // @ts-ignore
  import AccentBar from "./_AccentBar.svelte";

  export let status: string;
  export let error: Error;

  // @ts-ignore
  const dev = process.env.NODE_ENV === "development";
</script>

<!--
    genre.guide - Error page Svelte route
    Copyright (C) 2020 Navith

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
-->
<Metadata
  pageTitle="{error.message} ({status})"
  description="You've come across an error. This is so sad" />

<AccentBar />

<main class="flex-1 flex flex-col items-center justify-center text-center">
  <h1
    class="font-medium font-heading text-4xl sm:text-5xl md:text-6xl
    light-theme:text-green-700 dark-theme:text-green-300 uppercase">
    {error.message}
  </h1>
  <p
    class="font-medium text-3xl sm:text-4xl md:text-5xl
    light-theme:text-green-600 dark-theme:text-green-400">
    {status}
  </p>

  <a
    class="mt-16 text-xl sm:text-2xl md:text-3xl light-theme:text-green-400
    light-theme:hover:text-green-500 dark-theme:text-green-600
    dark-theme:hover:text-green-500"
    href="/">
    return to the homepage
  </a>

  {#if dev && error.stack}
    <pre>{error.stack}</pre>
  {/if}
</main>

<AccentBar />
