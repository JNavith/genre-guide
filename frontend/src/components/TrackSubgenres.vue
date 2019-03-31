<template>
	<div class="flex flex-row items-center">
		<template v-for="(subgenre, index) in subgenres">
			<SubgenreBadge v-if="!isOperator(subgenre)" :name="subgenre" :color-background="tailwindColors[index][0]" :color-foreground="tailwindColors[index][1]"></SubgenreBadge>
			<template v-else>
				<div v-if="subgenre === '|'" class="mx-1">
					<IconPlus :svg-class="['h-8', 'w-8']" path-class="text-gray-500" />
				</div>
				<div v-if="subgenre === '>'" class="mx-2">
					<IconArrowRight :svg-class="['h-6', 'w-6']" path-class="text-gray-500" />
				</div>
				<!-- Todo: actual (SVG) icon-->
				<div v-if="subgenre === '~'" class="mx-2 text-gray-500 text-2xl">~</div>
			</template>
		</template>
	</div>
</template>

<script lang="js">
	import SubgenreBadge from "./SubgenreBadge"
	import IconPlus from "./icons/IconPlus"
	import IconArrowRight from "./icons/IconArrowRight"
	import Vue from 'vue';
	
	
	export default Vue.extend({
		name: "TrackSubgenres",
		components: {SubgenreBadge, IconPlus, IconArrowRight},
		methods: {
			isOperator(text) {
				return ["|", ">", "~"].indexOf(text) !== -1
			}
		},
		props: {
			subgenres: {
				type: Array,
				required: true
			},
			tailwindColors: {
				type: Array,
				required: true
			}
		}
	})
</script>

<style scoped>

</style>
