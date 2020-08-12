<script>
  import { groupBy } from "utils";
  import TrackCatalogEntry from "./_TrackCatalogEntry.svelte";
  import { State } from "./state";
  import type { TrackEntry } from "./state";

  export let state: State;
  export let tracks: TrackEntry[] = [];

  let tracksByDate: Map<string, TrackEntry[]>;
  $: tracksByDate = groupBy(
    tracks,
    ({ releaseDate }) => (releaseDate as any) as string
  );
</script>

<!--
		genre.guide - Track catalog Svelte component
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
<table class="overflow-x-auto text-left border-separate border-spacing-4">
  {#if state === State.Loaded}
    <thead class="text-xl light-theme:text-gray-600 dark-theme:text-gray-400">
      <tr>
        <th class="w-40 font-light">Release Date</th>
        <th />
        <th class="font-light w-128">Song and Artist</th>
        <th class="font-light min-w-96">Subgenres</th>
        <th class="hidden w-48 font-light xl:table-cell">Record Label</th>
      </tr>
    </thead>
  {/if}

  {#each [...tracksByDate.values()] as tracksOnThisDate, dateIndex}
    <!-- Hack to imitate padding / margin in a table -->
    {#if dateIndex !== 0}
      <tr class="h-5" aria-hidden="true" />
    {/if}
    <!-- Border between different dates -->
    <tr
      class="h-1 transition-bg light-theme:bg-gray-300 dark-theme:bg-gray-700"
      aria-hidden="true">

      <td colspan={5} />
    </tr>

    {#each tracksOnThisDate as { loadIndex, id, ...track }, index (id)}
      <TrackCatalogEntry {...track} {index} transitionIndex={loadIndex} />
    {/each}
  {/each}
</table>
