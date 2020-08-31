<script context="module">
	export const preload = () => {};
</script>

<script>
	import { sideEffects } from "theme-logic";

	// Allow loaded tracks to persist through page changes
	import { wrappedMachine } from "./catalog/state";

	// `segment` will create a warning if not expected: https://github.com/sveltejs/sapper-template/issues/210
	// https://github.com/sveltejs/sapper/issues/824
	export let segment: string = "";
	// Silence unused export property warning
	if (segment) {}
</script>


<slot />
