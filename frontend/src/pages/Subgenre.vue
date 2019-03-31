<template>
	<div class="font-sans leading-tight min-h-screen flex flex-1 flex-col relative selection:text-white" :class="isLoaded ? ('selection:bg-' + genreTailwind) : 'selection:bg-gray-600'">
		<div class="h-1 transition" :class="isLoaded ? ('bg-' + genreTailwind) : 'bg-gray-600'"></div>
		<the-header link-inactive="gray-600" link-active="gray-800"></the-header>
		<main class="flex flex-1 flex-col w-full">
			<transition name="fade-slow">
				<div v-if="isLoaded" key="1" class="mx-6 md:mx-10 lg:mx-16 xxl:mb-16">
					<div class="container mx-auto flex flex-col xxl:flex-row">
						<div class="flex-1 mb-20 xxl:mb-0 xxl:mr-10 self-start xxl:sticky top-0 pt-8 -mt-8">
							<div class="table border-b-4 border-genre-this ml-1 mb-5">
								<h1 class="font-black md:font-medium text-4xl sm:text-5xl md:text-6xl text-black font-header -ml-1 mb-1">Space Bass</h1>
								<h2 class="font-thin text-2xl-responsive italic font-header text-gray-800 mb-2">Also known as
									<strong class="font-medium">Midtempo Bass</strong> or
									<strong class="font-medium">REZZ Bass</strong>
								</h2>
							</div>
							<p class="font-sans text-xl-responsive font-light ml-1 leading-loose text-justify">
								A genre popularized by REZZ. She makes this genre. Gesaffelstein did it first though. Here is more history. And also how you can tell what makes this genre what it is. REZZ though. REZZity REZZ REZZ. REZZ REZZ REZZ. Listen to REZZ.
							</p>
							<div class="flex-1 py-8 container mx-auto">
								<div class="text-black rounded tracking-medium">
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else key="2" class="fixed inset-0 flex flex-col justify-center items-center text-gray-400">
					<line-scale-pulse-out-rapid-loader size="3rem" color="#CBD5E0"></line-scale-pulse-out-rapid-loader>
					<p class="mt-6 text-2xl-responsive">The subgenre view is loading</p>
				</div>
			</transition>
		</main>
		<div class="h-1 transition" :class="isLoaded ? ('bg-' + genreTailwind) : 'bg-gray-600'"></div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue"
	
	import 'vue-loaders/dist/vue-loaders.css'
	// @ts-ignore
	// noinspection TypeScriptCheckImport
	import {LineScalePulseOutRapidLoader} from 'vue-loaders';
	
	import TheHeader from "../components/TheHeader.vue";
	
	import "../../tailwind.postcss"
	
	export default Vue.extend({
		components: {
			LineScalePulseOutRapidLoader,
			TheHeader,
		},
		created(): void {
			let component = this;
			
			setTimeout(() => {
				component.isLoaded = true
				component.genreTailwind = "genre-industrial"
				document.title = "Space Bass - genre.guide"
			}, 1000);
		},
		data() {
			return {
				isLoaded: false,
				genreTailwind: "",
			}
		}
	})
</script>

<style>
	.fade-slow-enter-active, .fade-slow-leave-active {
		transition: opacity 400ms ease-in;
	}
	
	.fade-slow-enter, .fade-slow-leave-to {
		transition: opacity 200ms ease-out;
		opacity: 0;
	}
</style>
