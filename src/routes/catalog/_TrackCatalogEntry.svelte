<script>
	import { onMount } from "svelte";
	// @ts-ignore -- doesn't package types
	import { ArrowRightIcon, PlusIcon, RepeatIcon } from "svelte-feather-icons";

	import Icon from "@iconify/svelte";
	import arrowRightIcon from "@iconify-icons/bx/bx-right-arrow-alt";
	import plusIcon from "@iconify-icons/bx/bx-plus";
	import repeatIcon from "@iconify-icons/bx/bx-repost";

	import TrackMissingArt from "./_TrackMissingArt.svelte";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
		// @ts-ignore -- need to write types for it
	} from "design-system";
	import { zip } from "utils";

	const { short } = transitionDurations;

	const { fade } = transitionFunctions;

	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	export let index: number;
	export let transitionIndex: number;

	export let name: string;
	export let artist: string;
	export let recordLabel: string;

	export let source: string;
	export let image: string | undefined;
	export let releaseDate: string | undefined = undefined;

	let date: Date;
	let year: number;
	let monthName: string;
	let day: number;
	$: if (releaseDate) {
		date = new Date(releaseDate);
		year = date.getFullYear();
		monthName = date.toLocaleString("default", { month: "long" });
		day = date.getDate() + 1;
	}

	export let subgenresFlat: any[];

	// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
	let mounted: boolean = !process.browser;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

{#if mounted}
	<tr
		in:fade={{ delay: Math.sqrt(transitionIndex) * 100, duration: short, easing: smoothOut }}
		class="align-top">
		<!-- Date -->
		<td
			class={index === 0 ? 'transition-all sticky light-theme:bg-white light-theme:shadow-white-glow dark-theme:bg-gray-900 dark-theme:shadow-gray-900-glow' : ''}
			style="top: 0.5rem">
			<p
				class="text-3xl leading-tight font-heading font-thin light-theme:text-gray-600 dark-theme:text-gray-100"
				class:sr-only={index !== 0}>
				{year}
			</p>
			<p
				class="text-xl leading-none font-normal light-theme:text-gray-500 dark-theme:text-gray-400"
				class:sr-only={index !== 0}>
				{monthName} {day}
			</p>
		</td>

		<!-- Artwork -->
		<td>
			<div class="w-10 h-10 shadow-md">
				{#if image !== null}
					<img src={image} alt={`"${name}" by ${artist}`} />
				{:else}
					<TrackMissingArt
						backgroundColor={subgenresFlat[0].backgroundColor}
						foregroundColor={subgenresFlat[0].textColor}
						size={40} />
				{/if}
			</div>
		</td>

		<!-- Song name and artist -->
		<td>
			<div>
				<p
					class="text-lg font-light leading-tight trim-both light-theme:text-gray-900 dark-theme:text-white light-theme:hover:text-black dark-theme:hover:text-white">

					<a
						class="border-b border-transparent hover:border-current focus:border-current"
						href={source}>
						{name}
					</a>
				</p>
			</div>
			<div class="mt-2">
				<p
					class="text-base font-light leading-tight trim-both text-md light-theme:text-gray-700 dark-theme:text-gray-300">
					{artist}
				</p>
			</div>
		</td>

		<!-- Subgenres -->
		<td>
			<ol>
				{#each subgenresFlat as item}
					<li class="inline-block text-center align-middle">
						{#if item.hasOwnProperty('symbol')}
							<div class="inline-block w-6 h-6 mx-1  light-theme:text-gray-500 dark-theme:text-gray-400">
								<!-- A separator of some kind -->
								<Icon icon={{ '|': plusIcon, '>': arrowRightIcon, '~': repeatIcon }[item.symbol]} width="100%" />
							</div>
						{:else}
							<!-- Subgenre button (may need to become a component sometime) -->
							<a
								style="background-color: {item.backgroundColor}; color: {item.textColor}"
								class="inline-block px-4 py-2 mb-2 font-bold text-center transition-all transform rounded-full shadow-md text-md min-w-32 hover:shadow-lg focus:shadow-outline-with-lg hover:scale-110 focus:scale-110"
								href="/subgenre/{encodeURIComponent(item.names[0])}"
								title={item.names[0]}
								rel="prefetch">
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
				class="text-lg font-light light-theme:text-gray-700 dark-theme:text-gray-400">
				{recordLabel}
			</p>
		</td>
	</tr>
{/if}
