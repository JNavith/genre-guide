<template>
	<div class="flex flex-row items-center">
		<template v-for="(subgenre, index) in subgenres">
			<SubgenreBadge v-if="!isOperator(subgenre)" :name="subgenre" :color-background="colors[index][0]" :color-foreground="colors[index][1]"></SubgenreBadge>
			<template v-else>
				<div v-if="subgenre === '|'" class="mx-1">
					<IconPlus :colorFill="'grey-dark'" :size="8" />
				</div>
				<div v-if="subgenre === '>'" class="mx-2">
					<IconArrowRight :colorFill="'grey-dark'" :size="6" />
				</div>
				<div v-if="subgenre === '~'" class="mx-2 text-grey-dark text-xl">~</div>
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
		computed: {
			subgenres() {
				return this.subgenresAndColors[0]
			},
			
			colors() {
				return this.subgenresAndColors[1]
			},
		},
		methods: {
			isOperator(text) {
				return ["|", ">", "~"].indexOf(text) !== -1
			}
		},
		props: {
			subgenresAndColors: {
				type: Array,
				required: true
			}
		}
	})
</script>

<style scoped>

</style>
