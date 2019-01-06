<template>
	<header class="block w-full font-header mb-6">
		<nav class="flex justify-between items-center py-4">
			<a href="/" class="block ml-6 md:ml-10 text-3xl-responsive font-medium transition" :class="['text-'+linkInactive, 'hover:text-'+linkActive]">
				<span>genre.guide</span>
				<span class="ml-2 opacity-75 font-normal text-2xl-responsive">(alpha)</span>
			</a>
			<div class="flex ml-6">
				<a v-for="dest in ['catalog', 'genres', 'about']" :key="dest" :href="'/'+dest" class="block mr-6 md:mr-10 text-xl-responsive transition font-normal" :class="['text-'+linkInactive, 'hover:text-'+linkActive]">{{ dest }}</a>
			</div>
		</nav>
	</header>
</template>

<script>
	import Vue from 'vue';
	
	export default Vue.extend({
		name: "TheHeader",
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
