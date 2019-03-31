<template>
	<div class="font-sans leading-tight min-h-screen flex flex-1 flex-col relative">
		<the-header link-inactive="green" link-active="green-dark" class="selection:bg-green selection:text-white">
			<a slot="left-side" href="/" class="block ml-3 sm:ml-6 md:ml-10 text-3xl-responsive font-medium transition text-green hover:text-green-dark">
				<span class="font-normal opacity-75">how we make</span>
				<span class="ml-2">genre.guide</span>
			</a>
		</the-header>
		<main class="flex flex-1 flex-col w-full selection:bg-white selection:text-green">
			<div v-for="tech in techs" class="min-h-48 w-full flex flex-1 justify-center" :style="{'background-color': tech.colorBackground}">
				<div class="container flex flex-1 p-8">
					<div class="w-32 h-32 flex-shrink-0 bg-center bg-contain bg-no-repeat" :style="{backgroundImage: `url(${tech.image})`}"></div>
					<div class="ml-10">
						<h1 class="font-header font-normal text-3xl-responsive text-shadow table border-b-4 mb-4" :style="{ color: tech.colorForeground }">{{ tech.title }}</h1>
						<p class="text-xl-responsive font-light leading-loose" :style="{'color': tech.colorForegroundSecondary}" v-html="tech.descriptionHtml"></p>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script lang="ts">
	import Vue from "vue"
	
	import TheHeader from "../components/TheHeader.vue";
	
	import "../../tailwind.postcss"
	
	export default Vue.extend({
		components: {
			TheHeader
		},
		data() {
			return {
				techs: [
					{
						title: "The Genre Sheet",
						descriptionHtml: `All subgenre identifications and history come from years of work by the team working on the <a href="https://docs.google.com/spreadsheets/d/1xZUWWnll7HzDVmNj_W7cBfz9TTkl-fMMqHZ8derG-Dg" class="font-medium underline text-current-color hover:text-white transition">Genre Sheet</a>, a publicly accessible Google Sheets spreadsheet.`,
						colorBackground: "#23A566",
						colorForeground: "#FFFFFF",
						colorForegroundSecondary: "#DBFFF6",
						image: "/img/sheets.svg",
					},
					{
						title: "GitHub",
						descriptionHtml: `The code that powers genre.guide is available as a <a href="https://github.com/SirNavith/genre.guide" class="font-medium underline text-current-color hover:text-black-light transition">GitHub repository</a>, where contributions are welcome! It’s also AGPL (Affero General Public License) 3 licensed, with modification instructions provided in the README.`,
						colorBackground: "#DCEEFE",
						colorForeground: "#22292F",
						colorForegroundSecondary: "#3D4852",
						image: "/img/github.png",
					},
					{
						title: "Discord",
						descriptionHtml: `Join us in discussion about genre.guide and the Genre Sheet on <a href="https://discord.gg/z5W6Cpd" class="font-medium underline text-current-color hover:text-white transition">our Discord server</a>.`,
						colorBackground: "#7289DA",
						colorForeground: "#FFFFFF",
						colorForegroundSecondary: "#EBF5FF",
						image: "/img/discord.svg",
					},
					{
						title: "GraphQL",
						descriptionHtml: `genre.guide’s API is available over the GraphQL query language at <a href="/graphql" class="font-medium underline text-current-color hover:text-white transition">this endpoint</a>. <br /> Opening this link in the browser will bring you to the GraphiQL playground, where you can and explore the schema experiment building queries with autocompletion. <br /> Note that the API is provisional and likely to break while you aren't looking.`,
						colorBackground: "#E535AB",
						colorForeground: "#FFFFFF",
						colorForegroundSecondary: "#FBCBFF",
						image: "/img/graphql.png",
					}
				],
			}
		},
	})
</script>

<style scoped>

</style>
