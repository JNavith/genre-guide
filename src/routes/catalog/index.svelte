<!--
		genre.guide - Catalog page
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

<script context="module">
	import { get } from "svelte/store";

	import svelteRobot from "../../globals/svelte-robot";
	import wrappedMachine, { createStateMachine, Send, State } from "./state";

	const mode = process.env.NODE_ENV;
	const dev = mode === "development";

	export async function preload() {
		const { context, send, state } = svelteRobot(get(wrappedMachine));
		
		send(Send.Load);

		if (!process.browser) {
			// Stall until loaded on the server
			await new Promise((resolve, reject) => {
				const unsubscribe = state.subscribe(($state) => {
					if ($state == State.Loaded) {
						unsubscribe();
						resolve();
					}
				});
			});
		}

		return { initialContext: get(context), initialState: get(state) };
	}
</script>

<script>
	import { onMount } from "svelte";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
		// @ts-ignore
	} from "../../globals/design-system";
	import { routes } from "../../globals/site";

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import NavigationBarTopLevel from "../_NavigationBar.svelte";
	import TrackCatalog from "./_TrackCatalog.svelte";
	import AccentBar from "../_AccentBar.svelte";

	const { short } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	const { catalog } = routes;

	export let initialContext = undefined;
	export let initialState = undefined;
	$wrappedMachine = createStateMachine(initialContext, initialState);
	let { context, state, send } = svelteRobot($wrappedMachine);

	$: console.log({ $context });
	$: console.log({ $state });
	$: console.log({ send });

	let mounted = !process.browser;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
</script>

<svelte:window
	on:scroll|passive={(event) => {
		const pixelsToBottom = (document.documentElement.scrollHeight - window.scrollY);
		const closeToBottom = pixelsToBottom < window.innerHeight * 3;
		
		if (closeToBottom) {
			console.log("you're close!!! let's load more tracks!");
			send(Send.Load);
		}
	}} />

<Metadata {...catalog} />

{#if mounted}
	<div 
		class="absolute w-full min-h-screen flex flex-col"
		transition:fade={{ delay: 0, duration: short, easing: smoothOut }}>

		<AccentBar />
		<NavigationBarTopLevel />

		<button on:click={() => send(Send.Load)}>{$state === State.Loading ? "Wait" : "Load"}</button>


		<main class="flex-1 flex flex-col items-center px-8">
			<TrackCatalog tracks={$context ? $context.tracks : []} />
		</main>

		<AccentBar />
	</div>
{/if}
