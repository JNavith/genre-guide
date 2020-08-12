<script context="module">
	import { tick } from "svelte";
	import { get } from "svelte/store";
	import type { Readable } from "svelte/store";

	import { svelteRobot } from "svelte-robot";
	import type { SvelteRobot } from "svelte-robot";
	import {
		createStateMachine, Send, State, wrappedMachine,
	} from "./state";
	import type { Context } from "./state";

	export async function preload(page) {
		const anyName = page.params.name;

		const robot: SvelteRobot<Context, string, State> = svelteRobot(get(wrappedMachine));
		const { context, send, state } = robot;

		if (get(state) === State.Empty) { send({ type: Send.Load, anyName, fetch: this.fetch }); }

		// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
		if (!process.browser) {
			// Stall until loaded (or failed to load) on the server
			await new Promise((resolve, reject) => {
				const unsubscribe = state.subscribe(($state) => {
					if ($state !== State.Empty && $state !== State.Loading) {
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
	import { stores } from "@sapper/app";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
	} from "design-system";

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import AccentBar from "../_AccentBar.svelte";
	import NavigationBar from "../_NavigationBar.svelte";

	const { short } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	const { page } = stores();

	export let initialContext = {};
	export let initialState: State;
	$wrappedMachine = createStateMachine(initialContext, initialState);
	const { context, state, send } = svelteRobot($wrappedMachine);

	// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
	let mounted = !process.browser;

	onMount(() => {
		mounted = true;

		return () => {
			mounted = false;
		};
	});
	
	// Update when the page changes (waiting until loading is finished otherwise the new load request will get lost)
	// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
	$: if (process.browser && $page.params.name && $state !== State.Loading) {
		tick().then(() => send({ type: Send.Load, anyName: $page.params.name, fetch }));
	}

	const joiner = (i: number, total: number, sayAnd: boolean = false) => {
		const spotsFromEnd = total - i;
		if (spotsFromEnd === 1) {
			return "";
		} if (spotsFromEnd === 2) {
			if (total > 2) {
				return `, ${sayAnd ? "and" : "or"} `;
			}
			return ` ${sayAnd ? "and" : "or"} `;
		}
		return ", ";
	};

	const infoRowsClasses = "text-2xl font-light";
	const infoHeadingsClasses = "py-4 pr-8 font-light text-left uppercase";
</script>

<Metadata
	pageTitle={$context.subgenre ? $context.subgenre.names[0] : "Subgenre"}
	description="Learn about the {$context.subgenre ? $context.subgenre.names[0] : 'Subgenre'} subgenre{$context.subgenre && $context.subgenre.names.length > 2 ? ` (also called ${$context.subgenre.names.slice(1).flatMap((name, i, arr) => [name, joiner(i, arr.length)]).join("")})` : ''}" />

{#if mounted}
	{#if $state === State.Loaded}
		<div
			class="absolute flex flex-col w-full min-h-screen"
			transition:fade={{ delay: 0, duration: short, easing: smoothOut }}>

			<AccentBar />
			<NavigationBar />

			<main
				class="flex flex-col items-center flex-1"
				transition:fade={{ delay: 0, duration: short, easing: smoothOut }}>
				{#if $context.subgenre}
					<article class="w-full max-w-5xl p-8 mt-8">
						<h1
							class="font-medium font-heading text-9xl tracking-tight
							light-theme:text-green-700 dark-theme:text-green-400 inline-block {$context.subgenre.names.slice(1).length > 0 ? '' : 'pb-4 border-b-4'}">
							{$context.subgenre.names[0] || $context.subgenre.names[0]}
						</h1>
						<br />

						{#if $context.subgenre.names.length > 1}
							<h2
								class="inline-block px-1 pb-2 mt-4 text-3xl italic font-light border-b-4 font-body light-theme:text-green-600 dark-theme:text-green-500">
								Also known as
								{#each $context.subgenre.names.slice(1) as alternativeName, i}
									<strong class="font-medium">{alternativeName}</strong>{joiner(i, $context.subgenre.names.length - 1)}
								{/each}
							</h2>
						{/if}

						<p class="mt-6 text-2xl font-light leading-relaxed font-body">
							{#if $context.subgenre.description}
								{$context.subgenre.description}
							{:else}
								<i class="light-theme:text-gray-600 dark-theme:text-gray-500">We don't have anything more to say about it yet.</i>
							{/if}
						</p>

						<table class="mt-12">
							<tr class={infoRowsClasses}>
								<th class={infoHeadingsClasses}>First Seen</th>
								<td><i class="light-theme:text-gray-600 dark-theme:text-gray-500">Not available yet</i></td>
							</tr>
							<tr class={infoRowsClasses}>
								<th class={infoHeadingsClasses}>Last Seen</th>
								<td><i class="light-theme:text-gray-600 dark-theme:text-gray-500">Not available yet</i></td>
							</tr>
							<tr class={infoRowsClasses}>
								<th class={infoHeadingsClasses}>Originates From</th>
								<td>
									{#each $context.subgenre.parents as parent, i}
										<a
											class="border-b border-transparent hover:border-current focus:border-current"
											href="/subgenre/{encodeURIComponent(parent.names[0])}"
											title={parent.names[0]}
											rel="prefetch">{parent.names[0]}</a>{joiner(i, $context.subgenre.parents.length, true)}
									{/each}
								</td>
							</tr>
							<tr class={infoRowsClasses}>
								<th class={infoHeadingsClasses}>Subgenres</th>
								<td>
									{#each $context.subgenre.children as child, i}
										<a
											class="border-b border-transparent hover:border-current focus:border-current"
											href="/subgenre/{encodeURIComponent(child.names[0])}"
											title={child.names[0]}
											rel="prefetch">{child.names[0]}</a>{joiner(i, $context.subgenre.children.length, true)}
									{/each}
								</td>
							</tr>
						</table>
					</article>
				{:else}
					where's the subgenre???
				{/if}
			</main>

			<AccentBar />
		</div>
	{:else if $state === State.Loading}
		loading lol todo: get something cool and good here
	{:else if $state === State.Error}
		wtf error!!!!! {$context.error}
	{:else}wtf is this?_?????? {$state} {$context}{/if}
{/if}
