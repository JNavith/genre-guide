<script lang="typescript">
  import { onMount } from "svelte";
  import { ArrowRightIcon, PlusIcon, RepeatIcon } from "svelte-feather-icons";

  import TrackMissingArt from "./_TrackMissingArt.svelte";

  import {
    easingFunctions,
    transitionDurations,
    transitionFunctions,
  } from "../../globals/design-system";
  import { zip } from "../../globals/utils";

  const { short } = transitionDurations;
  const {
    opacity: shortOpacityDuration,
    transform: shortTransformDuration,
  } = short;

  const { fadeSlide } = transitionFunctions;
  const { smoothIn, smoothOut } = easingFunctions;

  export let index: number;
  export let transitionIndex: number;

  export let name: string;
  export let artist: string;
  export let recordLabel: string;
  export let image: string | null;
  export let date: string;

  let dateAsDate: Date;
  let year: number;
  let monthName: string;
  let day: number;
  $: if (date !== undefined) {
    dateAsDate = new Date(date);
    year = dateAsDate.getFullYear();
    monthName = dateAsDate.toLocaleString("default", { month: "long" });
    day = dateAsDate.getDate() + 1;
  }

  export let subgenresFlat: any;

  let mounted: boolean = !process.browser;

  onMount(() => {
    mounted = true;

    return () => {
      mounted = false;
    };
  });
</script>

<!--
    genre.guide - Track catalog entry Svelte component
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
{#if mounted}
  <tr
    in:fadeSlide={{ delay: Math.sqrt(transitionIndex) * 100, opacityDuration: shortOpacityDuration, opacityEasing: smoothIn, translateYPercent: -100, transformDuration: shortTransformDuration, transformEasing: smoothOut }}>
    <!-- Date -->
    <td
      class={index === 0 ? 'font-heading font-light transition-all sticky top-0 light-theme:bg-white light-theme:shadow-white-glow dark-theme:bg-gray-900 dark-theme:shadow-gray-900-glow' : ''}>
      {#if index === 0}
        <p
          class="text-2xl light-theme:text-gray-600 dark-theme:text-gray-100
          leading-tight">
          {year}
        </p>
        <p
          class="text-xl light-theme:text-gray-500 dark-theme:text-gray-400
          leading-none">
          {monthName} {day}
        </p>
      {/if}
    </td>

    <!-- Artwork -->
    <td>
      <div class="w-12 h-12 shadow-md">
        {#if image !== null}
          <img src={image} alt={`"${name}" by ${artist}`} />
        {:else}
          <TrackMissingArt
            backgroundColor={subgenresFlat[0].backgroundColor}
            foregroundColor={subgenresFlat[0].textColor} />
        {/if}
      </div>
    </td>

    <!-- Song name and artist -->
    <td>
      <p
        class="text-lg font-light light-theme:text-gray-900
        dark-theme:text-white leading-tight">
        {name}
      </p>
      <p
        class="text-md font-light light-theme:text-gray-700
        dark-theme:text-gray-400 leading-none">
        {artist}
      </p>
    </td>

    <!-- Subgenres -->
    <td>
      <ol class="flex items-center">
        {#each subgenresFlat as item}
          <li class="flex-shrink-0 mr-2">
            {#if item.hasOwnProperty('symbol')}
              <div
                class="w-6 h-6 light-theme:text-gray-500
                dark-theme:text-gray-500">
                <!-- A separator of some kind -->
                <svelte:component
                  this={{ '|': PlusIcon, '>': ArrowRightIcon, '~': RepeatIcon }[item.symbol]} />
              </div>
            {:else}
              <!-- Subgenre button (may need to become a component sometime) -->
              <a
                style="background-color: {item.backgroundColor}; color: {item.textColor}"
                class="block rounded-full font-medium text-center text-md
                min-w-32 px-4 py-2 transition-all shadow-md
                focus:shadow-outline-with-md transform hover:scale-105 focus:scale-105"
                href="/subgenre/{encodeURIComponent(item.names[0])}"
                title={item.names[0]}>
                {item.names[0]}
              </a>
            {/if}
          </li>
        {/each}
      </ol>
    </td>

    <!-- Record label -->
    <td class="hidden xl:table-cell">
      <p
        class="text-lg font-light light-theme:text-gray-700
        dark-theme:text-gray-400">
        {recordLabel}
      </p>
    </td>
  </tr>
{/if}
