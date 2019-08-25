<script>
  import { sineIn, sineOut } from "svelte/easing";
  import { ArrowRightIcon, PlusIcon, RepeatIcon } from "svelte-feather-icons";
  import TrackMissingArt from "./TrackMissingArt.svelte";
  import { fadeSlide } from "../transitions.js";

  const groupBy = (array, func) => {
    const grouped = new Map([]);

    array.forEach(value => {
      const key = func(value);
      const groupItem = grouped.get(key);

      if (groupItem === undefined) {
        grouped.set(key, [value]);
      } else {
        groupItem.push(value);
      }
    });

    return grouped;
  };
  const zip = (array1, array2) =>
    array1.map((element, index) => [element, array2[index]]);

  export let tracks = [];
  $: tracksByDate = groupBy(
    tracks,
    ({ date: { year, monthName, day } }) => `${year} ${monthName} ${day}`
  );
</script>

<table class="borders-separate border-spacing-4 text-left overflow-x-auto">
  <thead class="text-lg theme-light:text-gray-600 theme-dark:text-gray-500">
    <tr>  
      <th class="font-light w-40">Release Date</th>
      <th />
      <th class="font-light w-128">Song and Artist</th>
      <th class="font-light w-96">Subgenres</th>
      <th class="font-light w-48 hidden xl:table-cell">Record Label</th>
    </tr>
  </thead>

  {#each [...tracksByDate.entries()] as [dateString, tracksOnThisDate], indexOfDate}
    <!-- Hack to imitate padding / margin in a table -->
    {#if indexOfDate !== 0}
      <tr class="h-5" />
    {/if}
    <!-- Border between different dates -->
    <tr
      class="h-1 transition-bg theme-light:bg-gray-300 theme-dark:bg-gray-700">
      <td colspan="5" />
    </tr>

    {#each tracksOnThisDate as track, indexOfTrackOnThisDate (track.id)}
      <tr
        in:fadeSlide={{ delay: Math.sqrt(track.loadIndex) * 100, opacityDuration: 250, opacityEasing: sineIn, translateYPercent: -100, transformDuration: 120, transformEasing: sineOut }}>
        <!-- Date -->
        <td
          class={indexOfTrackOnThisDate === 0 ? 'font-heading font-light transition-all sticky top-0 theme-light:bg-white theme-light:shadow-white-glow theme-dark:bg-gray-900 theme-dark:shadow-gray-900-glow' : ''}>
          {#if indexOfTrackOnThisDate === 0}
            <p
              class="text-2xl theme-light:text-gray-600 theme-dark:text-gray-100
              leading-tight">
              {track.date.year}
            </p>
            <p
              class="text-xl theme-light:text-gray-500 theme-dark:text-gray-400
              leading-none">
              {track.date.monthName} {track.date.day}
            </p>
          {/if}
        </td>

        <!-- Artwork -->
        <td>
          <div class="w-12 h-12 shadow-md">
            {#if track.image !== null}
              <img
                src={track.image}
                alt={`"${track.name}" by ${track.artist}`} />
            {:else}
              <TrackMissingArt
                backgroundColor={JSON.parse(track.subgenresWithHexColorsJSON)[1][0][0]}
                foregroundColor={JSON.parse(track.subgenresWithHexColorsJSON)[1][0][1]} />
            {/if}
          </div>
        </td>

        <!-- Song name and artist -->
        <td>
          <p
            class="text-lg font-thin theme-light:text-gray-900
            theme-dark:text-white leading-tight">
            {track.name}
          </p>
          <p
            class="text-md font-thin theme-light:text-gray-700
            theme-dark:text-gray-400 leading-none">
            {track.artist}
          </p>
        </td>

        <!-- Subgenres -->
        <td>
          <ol class="flex items-center">
            {#each zip(...JSON.parse(track.subgenresWithHexColorsJSON)) as [subgenreName, colors]}
              <li class="flex-shrink-0 mr-2">
                {#if colors !== null}
                  <!-- Subgenre button (may need to become a component sometime) -->
                  <a
                    style={`background-color: ${colors[0]}; color: ${colors[1]}`}
                    class="block rounded-full font-medium text-center text-md
                    min-w-32 px-4 py-2 transition-all shadow-md hover:shadow-lg
                    focus:shadow-outline-with-lg hover:-translate-y-1
                    focus:-translate-y-1"
                    href={`/subgenre/${encodeURIComponent(subgenreName)}`}>
                    {subgenreName}
                  </a>
                {:else}
                  <div
                    class="w-6 h-6 theme-light:text-gray-500
                    theme-dark:text-gray-500">
                    <!-- Actually a separator of some kind -->
                    <svelte:component
                      this={{ '|': PlusIcon, '>': ArrowRightIcon, '~': RepeatIcon }[subgenreName]} />
                  </div>
                {/if}
              </li>
            {/each}
          </ol>
        </td>

        <!-- Record label -->
        <td class="hidden xl:table-cell">
          <p
            class="text-lg font-thin theme-light:text-gray-700
            theme-dark:text-gray-400">
            {track.recordLabel}
          </p>
        </td>
      </tr>
    {/each}
  {/each}
</table>
