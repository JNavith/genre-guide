<template>
	<!-- Attribution: Heroicons UI (by Steve Schoger) -- MIT license -->
	<!-- https://github.com/sschoger/heroicons-ui -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" :class="svgClass">
		<path class="heroicon-ui fill-current" :class="pathClass"
		      d="M18.59 13H3a1 1 0 0 1 0-2h15.59l-5.3-5.3a1 1 0 1 1 1.42-1.4l7 7a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.42-1.4l5.3-5.3z" />
	</svg>
</template>

<script lang="js">
	import Vue from 'vue';
	
	export default Vue.extend({
		name: "IconArrowRight",
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
