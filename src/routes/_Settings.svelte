<!--
		genre.guide - Top level settings menu Svelte component
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
	import { SettingsIcon } from "svelte-feather-icons";
	import { writable } from "svelte/store";
	
	import StyledSwitch from "../components/Switches/Styled.svelte";
	import ThemeSwitch from "../components/Switches/Theme.svelte";
	
	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
	} from "../globals/design-system";

	import { theme, systemTheme, systemThemeSupported } from "../globals/theme-logic";

	const { short } = transitionDurations;
	const { fadeSlide } = transitionFunctions;
	const { smoothIn, smoothOut } = easingFunctions;
	
	const {
		opacity: shortOpacityDuration,
		transform: shortTransformDuration,
	} = short;
	
	let open = false;
</script>

<style lang="postcss">
	.disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>

<svelte:window on:click={() => open = false} />

<button
	title="Settings"
	class="block mr-3 sm:mr-4 md:mr-6 h-4 w-4 flex-shrink-0 cursor-pointer
	light-theme:text-green-500 light-theme:hover:text-green-600
	dark-theme:text-green-400 dark-theme:hover:text-green-300"
	on:click|stopPropagation={() => open = !open}
	aria-haspopup="true"
	aria-expanded={open}>
	<SettingsIcon />
</button>

{#if open}
	<ul
		in:fadeSlide={{ opacityDuration: shortOpacityDuration, opacityEasing: smoothIn, translateYPercent: -200, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
		out:fadeSlide={{ opacityDuration: shortOpacityDuration, opacityEasing: smoothOut, translateYPercent: -100, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
		class="absolute top-0 right-0 z-10 whitespace-no-wrap mr-3 sm:mr-4 md:mr-6
		mt-6 px-3 py-2 light-theme:bg-gray-100 light-theme:text-gray-700
		dark-theme:bg-gray-800 dark-theme:text-gray-400 font-body font-light
		list-none rounded shadow-md"
		on:click|stopPropagation>

		<li
			class="flex justify-between items-center"
			class:disabled={!$systemThemeSupported}
			title={!$systemThemeSupported ? 'This option is disabled because your operating system or web browser does not support theming. Instead, set your theme manually with the switch below' : undefined}>
			<span
				class="lowercase"
				title={$systemThemeSupported ? 'Your theme on this website will automatically update to match the one your device uses' : undefined}>
				Use device theme
			</span>

			<StyledSwitch
				bind:state={$systemTheme}
				disabled={!$systemThemeSupported} />
		</li>

		<li
			class="flex justify-between items-center mt-2 transition-opacity {$systemThemeSupported && $systemTheme ? 'cursor-not-allowed opacity-50' : ''}"
			title={$systemThemeSupported && $systemTheme ? "The theme cannot be changed while 'use device theme' is on because it would have no effect. Disable it to be able to manually change the theme" : undefined}>

			<span class="lowercase">Theme</span>

			<ThemeSwitch
				bind:state={$theme}
				disabled={$systemThemeSupported && $systemTheme} />
		</li>
	</ul>
{/if}
