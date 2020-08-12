<script>
  import { onMount } from "svelte";

  import Metadata from "../../components/Renderless/Metadata.svelte";
  import NavigationBar from "./_NavigationBar.svelte";

  import { technologies } from "./_technologies";

  import { routes } from "site";

  import {
    easingFunctions,
    transitionDurations,
    transitionFunctions,
    // @ts-ignore -- need to write types for it
  } from "design-system";

  const { short } = transitionDurations;
  const { fade } = transitionFunctions;
  const { smooth } = easingFunctions;
  const { out: smoothOut } = smooth;

  // @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
  let mounted: boolean = !process.browser;

  onMount(() => {
    mounted = true;

    return () => {
      mounted = false;
    };
  });
</script>

<!--
	genre.guide - About page Svelte route
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
<Metadata title={routes.about.title} description={routes.about.description} />

{#if mounted}
  <div
    class="absolute w-full min-h-screen flex flex-col selection:!text-white
    selection:!bg-black"
    transition:fade={{ delay: 0, duration: short, easing: smoothOut }}>

    <NavigationBar />

    <ul class="flex flex-col flex-1">
      {#each technologies as Technology}
        <Technology />
      {/each}
    </ul>
  </div>
{/if}
