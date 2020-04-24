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
	import { sineIn, sineOut, sineInOut } from "svelte/easing";
	// @ts-ignore
	import { SettingsIcon } from "svelte-feather-icons";
	// @ts-ignore
	import { easingFunctions, transitionDurations, transitionFunctions, themes } from "../globals/design-system";
	import { writable } from "svelte/store";

	// @ts-ignore
	import Binary from "./Renderless/Binary.svelte";
	// @ts-ignore
	import StyledSwitch from "./Switches/Styled.svelte";
	// @ts-ignore
	import ThemeSwitch from "./Switches/Theme.svelte";
	// @ts-ignore
	import ThemeLogic from "./Renderless/ThemeLogic.svelte";

	// @ts-ignore
	const { short } = transitionDurations;
	// @ts-ignore
	const { fadeSlide } = transitionFunctions;
	// @ts-ignore
	const { smoothIn, smoothOut } = easingFunctions;
	// @ts-ignore
	const { opacity: shortOpacityDuration, transform: shortTransformDuration} = short;

	// @ts-ignore
	let closeDropdown: () => void;
	// @ts-ignore
	let toggleDropdown: () => void;

	// @ts-ignore
	let theme = writable<undefined | "light" | "dark">(undefined);
	// @ts-ignore
	let systemTheme = writable<undefined | boolean>(undefined);
	// @ts-ignore
	let systemThemeSupported: boolean;
</script>

<svelte:window on:click={() => closeDropdown()} />

<ThemeLogic bind:theme bind:systemTheme bind:systemThemeSupported />

<Binary
	initial={false}
	bind:turnOff={closeDropdown}
	let:state
	bind:toggle={toggleDropdown}>
	<div
		title="Settings"
		class="block mr-3 sm:mr-4 md:mr-6 h-4 w-4 flex-shrink-0
		hover:cursor-pointer theme-light:text-green-500
		theme-light:hover:text-green-600 theme-dark:text-green-400
		theme-dark:hover:text-green-300"
		on:click|stopPropagation={() => toggleDropdown()}
		on:keydown={({ key }) => {
			if (key == 'Enter') toggleDropdown();
		}}
		tabindex="0">
		<SettingsIcon />
	</div>

	{#if state}
		<ul
			in:fadeSlide={{ opacityDuration: shortOpacityDuration, opacityEasing: smoothIn, translateYPercent: -200, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
			out:fadeSlide={{ opacityDuration: shortOpacityDuration, opacityEasing: smoothOut, translateYPercent: -100, transformDuration: shortTransformDuration, transformEasing: smoothOut }}
			class="absolute top-0 right-0 z-10 whitespace-no-wrap mr-3 sm:mr-4
			md:mr-6 mt-6 px-3 py-2 theme-light:bg-gray-100
			theme-light:text-gray-700 theme-dark:bg-gray-800
			theme-dark:text-gray-400 font-body font-light list-none rounded shadow-md"
			on:click|stopPropagation>

			<li
				class="flex justify-between items-center {!systemThemeSupported ? 'cursor-not-allowed opacity-50' : ''}"
				title={!systemThemeSupported ? 'This option is disabled because your operating system or web browser does not support theming. Instead, set your theme manually with the switch below' : undefined}>
				<span
					class="lowercase"
					title={systemThemeSupported ? 'Your theme on this website will automatically update to match the one your device uses' : undefined}>
					Use device theme
				</span>

				<StyledSwitch
					bind:state={$systemTheme}
					disabled={!systemThemeSupported} />
			</li>

			<li
				class="flex justify-between items-center mt-2 transition-opacity
				{systemThemeSupported && $systemTheme ? 'cursor-not-allowed opacity-50' : ''}"
				title={systemThemeSupported && $systemTheme ? "The theme cannot be changed while 'use os theme' is on because it would have no effect. Disable it to be able to manually change the theme" : undefined}>

				<span class="lowercase">Theme</span>

				<ThemeSwitch
					bind:state={$theme}
					disabled={systemThemeSupported && $systemTheme} />
			</li>
		</ul>
	{/if}
</Binary>
