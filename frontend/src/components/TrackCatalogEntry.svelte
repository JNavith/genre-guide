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

<script lang="typescript">
	import { onMount } from "svelte";
	// @ts-ignore
	import { ArrowRightIcon, PlusIcon, RepeatIcon } from "svelte-feather-icons";

	// @ts-ignore
	import TrackMissingArt from "./TrackMissingArt.svelte";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions
	} from "../globals/design-system";
	// @ts-ignore
	import { zip } from "../globals/utils";

	const { short } = transitionDurations;
	// @ts-ignore
	const { opacity: shortOpacityDuration, transform: shortTransformDuration} = short;

	// @ts-ignore
	const { fadeSlide } = transitionFunctions;
	// @ts-ignore
	const { smoothIn, smoothOut } = easingFunctions;

	export let index: number;
	export let transitionIndex: number;

	export let name: string;
	export let artist: string;
	export let recordLabel: string;
	export let image: string | null;
	export let date: string;

	// @ts-ignore
	let dateAsDate: Date;
	// @ts-ignore
	let year: number;
	// @ts-ignore
	let monthName: string;
	// @ts-ignore
	let day: number;
	// @ts-ignore
	$: if (date !== undefined) {
		dateAsDate = new Date(date);
		year = dateAsDate.getFullYear();
		monthName = dateAsDate.toLocaleString("default", { month: "long" });
		day = dateAsDate.getDate() + 1;
	};

	// @ts-ignore
	export let subgenresFlat;

	// @ts-ignore
	let mounted: boolean = false;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

{#if mounted}
	<tr
		in:fadeSlide={{ delay: Math.sqrt(transitionIndex) * 100, opacityDuration: shortOpacityDuration, opacityEasing: smoothIn, translateYPercent: -100, transformDuration: shortTransformDuration, transformEasing: smoothOut }}>
		<!-- Date -->
		<td
			class={index === 0 ? 'font-heading font-light transition-all sticky top-0 theme-light:bg-white theme-light:shadow-white-glow theme-dark:bg-gray-900 theme-dark:shadow-gray-900-glow' : ''}>
			{#if index === 0}
				<p class="text-2xl theme-light:text-gray-600 theme-dark:text-gray-100 leading-tight">
					{year}
				</p>
				<p class="text-xl theme-light:text-gray-500 theme-dark:text-gray-400 leading-none">
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
			<p class="text-lg font-light theme-light:text-gray-900 theme-dark:text-white leading-tight">
				{name}
			</p>
			<p class="text-md font-light theme-light:text-gray-700 theme-dark:text-gray-400 leading-none">
				{artist}
			</p>
		</td>

		<!-- Subgenres -->
		<td>
			<ol class="flex items-center">
				{#each subgenresFlat as item}
					<li class="flex-shrink-0 mr-2">
						{#if item.hasOwnProperty("symbol")}
							<div
								class="w-6 h-6 theme-light:text-gray-500
								theme-dark:text-gray-500">
								<!-- A separator of some kind -->
								<svelte:component this={{ '|': PlusIcon, '>': ArrowRightIcon, '~': RepeatIcon }[item.symbol]} />
							</div>
						{:else}
							<!-- Subgenre button (may need to become a component sometime) -->
							<a style="background-color: {item.backgroundColor}; color: {item.textColor}"
							   class="block rounded-full font-medium text-center text-md min-w-32 px-4 py-2
								      transition-all shadow-md hover:shadow-lg focus:shadow-outline-with-lg
								      transform hover:-translate-y-1 focus:-translate-y-1"
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
				class="text-lg font-light theme-light:text-gray-700
				theme-dark:text-gray-400">
				{recordLabel}
			</p>
		</td>
	</tr>
{/if}
