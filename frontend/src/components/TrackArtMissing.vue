<template>
	<!-- Attribution: Heroicons UI (by Steve Schoger) -- MIT license -->
	<!-- https://github.com/sschoger/heroicons-ui -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 32 32" width="24" height="24" :style="{ height, width}">
		<rect :fill="colorBackground" x="-4" y="-4" width="32" height="32" />
		<path :fill="colorForeground" class="heroicon-ui"
		      d="M8 14.54V6a1 1 0 0 1 .76-.97l12-3A1 1 0 0 1 22 3v12a4 4 0 1 1-2-3.46V4.28l-10 2.5V18a4 4 0 1 1-2-3.46zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
	</svg>
</template>

<script>
	import Vue from "vue"
	
	export default Vue.extend({
		name: "TrackArtMissing",
		props: {
			height: {
				type: Number,
				required: false,
				default: 24
			},
			width: {
				type: Number,
				required: false,
				default: 24
			},
			colorBackground: {
				type: String,
				required: true
			},
			colorForeground: {
				type: String,
				required: true
			}
		}
	})
</script>

<style scoped>

</style>
