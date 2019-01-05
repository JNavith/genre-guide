<template>
	<a :href="'/subgenre?name='+encodeURIComponent(name)" class="block rounded-full font-sans font-medium text-center text-md-responsive min-w-32 px-4 py-2 leading-none select-none no-underline hover:no-underline shadow-sm hover:shadow-md transition hover:-translate-y-1" :class="['text-' + colorForeground, 'bg-' + colorBackground]">{{ name }}</a>
</template>

<script lang="js">
	import Vue from "vue"
	
	export default Vue.extend({
		name: "SubgenreBadge",
		props: {
			name: {
				type: String,
				required: true
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
