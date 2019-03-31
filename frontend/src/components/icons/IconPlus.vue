<template>
	<!-- Attribution: Heroicons UI (by Steve Schoger) -- MIT license -->
	<!-- https://github.com/sschoger/heroicons-ui -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" :class="svgClass">
		<path class="heroicon-ui fill-current-color" :class="pathClass"
		      d="M17 11a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4z" />
	</svg>
</template>

<script lang="js">
	import Vue from 'vue';
	
	export default Vue.extend({
		name: "IconPlus",
		props: {
			svgClass: {
				type: [Object, Array, String],
				required: false,
				default: () => [],
			},
			pathClass: {
				type: [Object, Array, String],
				required: false,
				default: () => [],
			},
		}
	})
</script>

<style scoped>

</style>
