<script>
	import { onMount } from "svelte";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
		// @ts-ignore -- need to write types for it
	} from "design-system";

	import Metadata from "../components/Renderless/Metadata.svelte";
	import AccentBar from "./_AccentBar.svelte";

	const { medium } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	export let status: string;
	export let error: Error;

	const mode = process.env.NODE_ENV;
	const dev = mode === "development";

	// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
	let mounted = !process.browser;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

<Metadata
	pageTitle="{error.message} ({status})"
	description="You've come across an error. This is so sad" />

{#if mounted}
	<div
		class="absolute flex flex-col w-full min-h-screen"
		transition:fade={{ delay: 0, duration: medium, easing: smoothOut }}>

		<AccentBar />

		<main class="flex flex-col items-center justify-center flex-1 text-center">
			<h1
				class="text-4xl font-medium uppercase font-heading sm:text-5xl
				md:text-6xl light-theme:text-green-700 dark-theme:text-green-300">
				{error.message}
			</h1>
			<p
				class="text-3xl font-medium sm:text-4xl md:text-5xl
				light-theme:text-green-600 dark-theme:text-green-400">
				{status}
			</p>

			<a
				class="mt-16 text-xl sm:text-2xl md:text-3xl light-theme:text-green-400
				light-theme:hover:text-green-500 dark-theme:text-green-600
				dark-theme:hover:text-green-500"
				href="/">
				return to the homepage
			</a>

			{#if dev && error.stack}
				<pre class="mt-8">{error.stack}</pre>
			{/if}
		</main>

		<AccentBar />
	</div>
{/if}
