<script context="module">
	import { get } from "svelte/store";

	import { svelteRobot } from "svelte-robot";
	import {
		createStateMachine, Send, State, wrappedMachine,
} from "./state";

	export async function preload() {
		const { context, send, state } = svelteRobot(get(wrappedMachine));

		if (get(state) === State.Empty) { send({ type: Send.Load, fetch: this.fetch }); }
		
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
	import { AlertTriangleIcon, ExternalLinkIcon } from "svelte-feather-icons";

	import {
		easingFunctions,
		transitionDurations,
		transitionFunctions,
	} from "design-system";
	import { name as siteName, repository, routes } from "site";

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import NavigationBar from "../_NavigationBar.svelte";
	import TrackCatalog from "./_TrackCatalog.svelte";
	import AccentBar from "../_AccentBar.svelte";

	const { short } = transitionDurations;
	const { fade } = transitionFunctions;
	const { smooth } = easingFunctions;
	const { out: smoothOut } = smooth;

	const { catalog } = routes;

	export let initialContext = {};
	export let initialState;
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

	const errorButtonBaseClasses = "inline-block px-3 py-1 -mx-3 -my-1 text-xl font-medium tracking-wider uppercase rounded-full group";
	const errorButtonLightThemeClasses = "light-theme:text-gray-700 light-theme:focus:bg-gray-300 light-theme:hover:bg-gray-300 light-theme:focus:text-black light-theme:hover:text-black light-theme:focus:shadow-outline-black";
	const errorButtonDarkThemeClasses = "dark-theme:text-gray-200 dark-theme:focus:bg-gray-600 dark-theme:hover:bg-gray-600 dark-theme:focus:text-white dark-theme:hover:text-white dark-theme:focus:shadow-outline-white";
	const errorButtonClasses = `${errorButtonBaseClasses} ${errorButtonLightThemeClasses} ${errorButtonDarkThemeClasses}`;

	$: errorList = $context.error ? ($context.error.errors ? $context.error.errors.map(({ message }) => message) : [$context.error.message]) : [];
	$: reportIssue = `${repository}/issues/new?title=${encodeURIComponent("Broken catalog")}&body=${encodeURIComponent(`I've gotten these errors: \n${errorList.map((error) => `- ${error}`).join("\n")}`)}`;
</script>

<svelte:window
	on:scroll|passive={(event) => {
		const pixelsToBottom = document.documentElement.scrollHeight - window.scrollY;
		const closeToBottom = pixelsToBottom < window.innerHeight * 3;
		if (false && closeToBottom) send({ type: Send.Load, fetch });
	}} />

<Metadata {...catalog} />

{#if mounted}
	<div
		class="absolute flex flex-col w-full min-h-screen"
		transition:fade={{ delay: 0, duration: short, easing: smoothOut }}>

		<AccentBar />
		<NavigationBar />

		<main class="flex flex-col items-center flex-1 px-8">
			<TrackCatalog state={$state} tracks={$context.tracks} />
			{#if $state === State.Error}
				<div class="flex flex-col justify-center flex-1 space-y-8 md:space-y-12">
					<div class="p-6 border-t-4 border-current light-theme:shadow-md dark-theme:shadow-lg light-theme:text-gray-500 dark-theme:text-gray-300 light-theme:bg-gray-100 dark-theme:bg-gray-800" role="dialog">
						<div class="flex">
							<div class="flex-shrink-0 inline-block w-6 h-6 my-1 mr-6 md:w-8 md:h-8 light-theme:text-gray-600 dark-theme:text-gray-300">
								<AlertTriangleIcon />
							</div>
							<div class="leading-normal">
								<p class="text-xl font-medium tracking-wider uppercase font-heading md:text-2xl light-theme:text-gray-700 dark-theme:text-gray-200">Internal error</p>
								<p class="mt-2 text-lg font-medium font-heading md:text-xl light-theme:text-gray-600 dark-theme:text-gray-300">{siteName}'s catalog is broken</p>
								<div class="mt-8 text-sm md:text-lg light-theme:text-gray-500 dark-theme:text-gray-400">
									<span class="font-medium tracking-wider uppercase">Details:</span>
									{#if $context.error.name === "APIError"}
										<ul class="inline">
											{#each $context.error.errors as error}
												<li class="inline">{error.message}</li>
												<br />
											{/each}
										</ul>
									{:else if $context.error.message.startsWith("timed out after 1000 ms")}
										<span>loading took too long, which may mean the backend is offline or still starting up</span>
									{:else}
										<span>{$context.error.message}</span>
										<span>{console.log($context.error) || JSON.stringify($context.error)}</span>
									{/if}
								</div>
								<div class="mt-10 text-right">
									<a class={errorButtonClasses} href={reportIssue}>
										<span class="border-b-2 border-transparent group-hover:border-current group-focus:border-current">Report</span>
										<div class="inline-block w-6 h-6 -mt-1 align-middle light-theme:text-gray-600 dark-theme:text-gray-300 light-theme:group-focus:text-gray-900 light-theme:group-hover:text-gray-900 dark-theme:group-focus:text-gray-100 dark-theme:group-hover:text-gray-100">
											<ExternalLinkIcon />
										</div>
									</a>
									<div class="inline-block w-10" />
									<button
										class={errorButtonClasses}
										on:click={() => send({ type: Send.Load, fetch })}>

										Retry
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else if $state === State.Loading}
				todo loading indicator
			{/if}
		</main>

		<AccentBar />
	</div>
{/if}
