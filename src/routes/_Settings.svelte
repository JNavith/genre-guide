<script>
	import Icon from "@iconify/svelte";
	import cogIcon from "@iconify-icons/bx/bxs-cog";

	import { writable } from "svelte/store";

	import { tooltip } from "tooltip";

	import StyledSwitch from "../components/Switches/Styled.svelte";
	import ThemeSwitch from "../components/Switches/Theme.svelte";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
		// @ts-ignore -- need to write types for it
	} from "design-system";

	import { theme, systemTheme, systemThemeSupported } from "theme-logic";

	const { short } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;

	const { out: smoothOut } = smooth;

	let open = false;
</script>

<style>
	.disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>

<svelte:window on:click={() => (open = false)} />

<button
	title="Settings"
	class="flex-shrink-0 block w-4 h-4 mr-3 cursor-pointer sm:mr-4 md:mr-6
	light-theme:text-green-500 light-theme:hover:text-green-600
	dark-theme:text-green-400 dark-theme:hover:text-green-300"
	on:click|stopPropagation={() => { open = !open }}
	use:tooltip
	aria-haspopup="true"
	aria-expanded={open}>

	<Icon icon={cogIcon} width="100%" />
</button>

{#if open}
	<ul
		transition:fade={{ delay: 0, duration: short, easing: smoothOut }}
		class="absolute top-0 right-0 z-10 px-3 py-2 mt-6 mr-3 font-light
		whitespace-no-wrap list-none rounded shadow-md sm:mr-4 md:mr-6
		light-theme:bg-gray-100 light-theme:text-gray-700 dark-theme:bg-gray-800
		dark-theme:text-gray-400 font-body"
		on:click|stopPropagation>

		<li
			class="flex items-center justify-between"
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
