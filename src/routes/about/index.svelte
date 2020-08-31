<script>
	import { onMount } from "svelte";

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import NavigationBar from "./_NavigationBar.svelte";

	import { technologies } from "./_technologies";

	import { routes } from "site";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
		// @ts-ignore -- need to write types for it
	} from "design-system/index";

	const { medium } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
	let mounted: boolean = !process.browser;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

<Metadata title={routes.about.title} description={routes.about.description} />

{#if mounted}
	<div
		class="absolute w-full min-h-screen flex flex-col selection:!text-white
		selection:!bg-black"
		transition:fade={{ delay: 0, duration: medium, easing: smoothOut }}>

		<NavigationBar />

		<ul class="flex flex-col flex-1">
			{#each technologies as Technology}
				<Technology />
			{/each}
		</ul>
	</div>
{/if}
