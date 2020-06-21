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
	import api from "../../globals/api";
	import wrappedMachine, { createStateMachine, Send, State } from "./state";

	const mode = process.env.NODE_ENV;
	const dev = mode === "development";

	export async function preload() {
		if (dev) console.log("I'm starting preload");
		if (!process.browser) {
			if (dev) console.log("I'm about to destructure the wrapped machine");
			const { context, send, state } = get(wrappedMachine);
			if (dev) console.log("I destructured the wrapped machine");

			send(Send.Load);

			// Stall until loaded on the server
			await new Promise((resolve, reject) => {
				const unsubscribe = state.subscribe(($state) => {
					if ($state == State.Loaded) {
						unsubscribe();
						resolve();
					}
				});
			});

			if (dev) console.log("I'm ending preload on the server");
			return { initialContext: get(context), initialState: get(state) };
		}
		if (dev) console.log("I'm ending preload");
	}
</script>

<script>
	import { onMount } from "svelte";

	import { routes } from "../../globals/site";

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import NavigationBarTopLevel from "../_NavigationBar.svelte";
	import TrackCatalog from "./_TrackCatalog.svelte";
	import AccentBar from "../_AccentBar.svelte";

	const { catalog } = routes;

	if (dev) console.log("catalog.svelte before props");
	export let initialContext = undefined;
	export let initialState = undefined;
	if (initialContext && initialState) {
		$wrappedMachine = createStateMachine(initialContext, initialState);
	}
	if (dev) console.log("catalog.svelte after optional machine creation");

	if (dev) console.log("catalog.svelte before extracting from machine");
	let { context, state, send } = $wrappedMachine;
	$: ({ context, state, send } = $wrappedMachine);
	if (dev) console.log("catalog.svelte after extracting from machine");
</script>

<svelte:window
  on:scroll|passive={(event) => {
    console.log(event);
  }} />

<Metadata {...catalog} />

<div class="absolute w-full min-h-screen flex flex-col">
	<AccentBar />
	<NavigationBarTopLevel />

	<button on:click={() => send(Send.Load)}>{$state === State.Loading ? "Wait" : "Load"}</button>


	<main class="flex-1 flex flex-col items-center px-8">
		<TrackCatalog tracks={$context ? $context.tracks : []} />
	</main>

	<AccentBar />
</div>
