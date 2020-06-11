<!--
    genre.guide - About page: Technology Svelte component
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

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions
	} from "../../globals/design-system";

	const { short } = transitionDurations;
	const {
		opacity: shortOpacityDuration,
		transform: shortTransformDuration
	} = short;

	const { fadeSlide } = transitionFunctions;
	const { smoothIn, smoothOut } = easingFunctions;

	export let index: number;
	export let technologiesLength: number;

	export let title: string;
	export let descriptionHtml: string;

	export let colorBackground: string;
	export let colorForeground: string;
	export let colorForegroundAccent: string;

	export let image: string;

    let mounted: boolean = !process.browser;
	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

<style>
	.technology :global(h1) {
		color: var(--colorForegroundAccent);
	}

	.technology :global(a) {
		@apply font-medium;
	}

	.technology :global(a):hover,
	.technology :global(a):focus {
		color: var(--colorForegroundAccent);
	}
</style>

{#if mounted}
	<li
		in:fadeSlide={{ delay: Math.sqrt(index) * 100, opacityDuration: shortOpacityDuration, opacityEasing: smoothIn, translateYPercent: -200, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
		out:fadeSlide={{ delay: Math.sqrt(technologiesLength - index - 1) * 100, opacityDuration: shortOpacityDuration, opacityEasing: smoothOut, translateYPercent: -100, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
		class="w-full flex-1 flex justify-center technology"
		style="--colorBackground: {colorBackground}; --colorForeground: {colorForeground};
		--colorForegroundAccent: {colorForegroundAccent}; background-color:
		var(--colorBackground); color: var(--colorForeground)">
		<div class="flex max-w-5xl flex-1 p-8">
			<div
				class="w-32 h-32 flex-shrink-0 bg-center bg-contain bg-no-repeat"
				style="background-image: url({image})" />
			<div class="ml-10">
				<h1
					class="font-heading font-normal text-3xl table border-b-4
					mb-4">
					{title}
				</h1>
				<p class="font-body font-light text-xl leading-loose">
					{@html descriptionHtml}
				</p>
			</div>
		</div>
	</li>
{/if}
