<template>
	<header class="block w-full font-header">
		<nav class="flex justify-between items-center py-4">
			<slot name="left-side">
				<a href="/" class="block ml-3 sm:ml-6 md:ml-10 text-3xl-responsive font-medium transition" :class="['text-'+linkInactive, 'hover:text-'+linkActive]">
					<span>genre.guide</span>
					<span class="ml-2 opacity-75 font-normal text-2xl-responsive">(alpha)</span>
				</a>
			</slot>
			<slot name="right-side">
				<div class="flex ml-6">
					<a v-for="dest in dests" :key="dest" :href="'/'+dest" class="block mr-3 sm:mr-6 md:mr-10 text-xl-responsive transition font-normal" :class="['text-'+linkInactive, 'hover:text-'+linkActive]">{{ dest }}</a>
				</div>
			</slot>
		</nav>
	</header>
</template>

<script>
	import Vue from "vue";
	
	export default Vue.extend({
		name: "TheHeader",
		data() {
			return {
				dests: ["catalog", "about"],
			}
		},
		props: {
			linkInactive: {
				type: String,
				required: false,
				default: 'grey-darker'
			},
			linkActive: {
				type: String,
				required: false,
				default: 'grey-darkest'
			}
		}
	})
</script>

<style scoped>

</style>
