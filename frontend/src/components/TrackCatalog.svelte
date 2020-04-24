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


<script lang="typescript">
	// @ts-ignore
	import TrackCatalogEntry from "./TrackCatalogEntry.svelte";
	import { groupBy } from "../globals/utils";
	export let tracks: any[] = [];

	// @ts-ignore
	let tracksByDate: Map<string, any[]>;
	$: tracksByDate = groupBy(tracks, ({ date }) => date);
</script>

<table class="border-separate border-spacing-4 text-left overflow-x-auto">
	<thead class="text-xl theme-light:text-gray-500 theme-dark:text-gray-400">
		<tr>
			<th class="font-light w-40">Release Date</th>
			<th />
			<th class="font-light w-128">Song and Artist</th>
			<th class="font-light w-96">Subgenres</th>
			<th class="font-light w-48 hidden xl:table-cell">Record Label</th>
		</tr>
	</thead>

	{#each [...tracksByDate.values()] as tracksOnThisDate, dateIndex}
		<!-- Hack to imitate padding / margin in a table -->
		{#if dateIndex !== 0}
			<tr class="h-5" />
		{/if}
		<!-- Border between different dates -->
		<tr
			class="h-1 transition-bg theme-light:bg-gray-300 theme-dark:bg-gray-700">
			<td colspan="5" />
		</tr>

		{#each tracksOnThisDate as { loadIndex, id, ...track }, index (id)}
			<TrackCatalogEntry
				{...track}
				{index}
				transitionIndex={loadIndex} />
		{/each}
	{/each}
</table>
