<!--
    genre.guide - Subgenre page Svelte route
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

<script lang="typescript" context="module">
  export async function preload(page) {
  	console.log(page.params);
  	return { subgenreName: page.params.name };
  }
</script>

<script lang="typescript">
  import Metadata from "../../components/Renderless/Metadata.svelte";
  import AccentBar from "../_AccentBar.svelte";

  export let subgenreName = "fix!!!!";
</script>

<Metadata
  pageTitle={subgenreName}
  description="Learn about the {subgenreName} subgenre (work in progress)" />

<AccentBar />

<main class="flex-1 flex flex-col items-center justify-center text-center">
  <h1
    class="font-medium font-heading text-4xl sm:text-5xl md:text-6xl
    light-theme:text-green-700 dark-theme:text-green-300 uppercase">
    page not available yet
  </h1>
  <p
    class="font-medium text-3xl sm:text-4xl md:text-5xl
    light-theme:text-green-600 dark-theme:text-green-400">
    subgenre pages are being worked on and are not usable yet
  </p>

  <a
    class="mt-16 text-xl sm:text-2xl md:text-3xl light-theme:text-green-400
    light-theme:hover:text-green-500 dark-theme:text-green-600
    dark-theme:hover:text-green-500"
    href="/">
    return to the homepage
  </a>
</main>

<AccentBar />
