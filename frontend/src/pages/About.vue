<template>
	<div class="font-sans min-h-screen flex flex-col relative">
		<div class="h-1 bg-green"></div>
		<the-header :link-inactive="'green'" :link-active="'green-dark'"></the-header>
		<main class="flex flex-1 mx-auto">
			
		</main>
		<div class="h-1 bg-green"></div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue"
	
	import TheHeader from "../components/TheHeader.vue";
	
	import "../../tailwind.postcss"
	
	export default Vue.extend({
		components: {
			TheHeader
		}
	})
</script>

<style scoped>

</style>
