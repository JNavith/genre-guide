<template>
	<div class="font-sans min-h-screen flex flex-col relative">
		<div class="h-1 bg-green"></div>
		<the-header :link-inactive="'green'" :link-active="'green-dark'"></the-header>
		<main class="flex flex-1 justify-center">
			<div class="mt-8 px-8">
				<transition name="fade-slow">
					<track-catalog v-if="tracks !== undefined && tracks.length > 0" :tracks="tracks"></track-catalog>
					<div v-else class="fixed pin-x flex flex-col justify-center items-center text-grey" style="top: 40vh">
						<div v-if="errorMessage === ''" class="flex flex-1 w-full justify-center items-center">
							<line-scale-pulse-out-rapid-loader size="50px" color="#B8C2CC"></line-scale-pulse-out-rapid-loader>
						</div>
						<p class="mt-6 text-2xl-responsive">
							<template v-if="errorMessage === ''">
								The catalog is loading
							</template>
							<template v-else>
								{{ errorMessage }}
							</template>
						</p>
					</div>
				</transition>
			</div>
		</main>
		<div class="h-1 bg-green"></div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue"
	import request from "graphql-request"
	import TheHeader from "../components/TheHeader.vue"
	import TrackCatalog from '../components/TrackCatalog.vue'
	
	import 'vue-loaders/dist/vue-loaders.css'
	// @ts-ignore
	import {LineScalePulseOutRapidLoader} from 'vue-loaders';
	
	import "../../tailwind.postcss"
	
	export default Vue.extend({
		components: {
			LineScalePulseOutRapidLoader,
			TheHeader,
			TrackCatalog,
		},
		created(): void {
			request("https://genre.guide/graphql", `
				{
					tracks {
						date {
							year
							monthName: month_name
							day
						}
						id
						name
						artist
						recordLabel: record_label
						image
						subgenresWithTailwindColorsJSON: subgenres_flat_json(and_colors: TAILWIND)
						subgenresWithHexColorsJSON: subgenres_flat_json(and_colors: HEX)
					}
				}
			`).then((data: Object): void => {
				(this as any).tracks = (data as any).tracks as Object[];
				(this as any).lastTrack = (this as any).tracks[(this as any).tracks.length - 1]
			}).catch(error => {
				if (error instanceof TypeError && error.message.startsWith("NetworkError")) {
					(this as any).errorMessage = "There was a network error trying to load the catalog"
				} else if (error.hasOwnProperty("response") && error.response!.errors.length > 0) {
					(this as any).errorMessage = "There was an error in the catalog response itself, which is probably out of your control"
				} else {
					(this as any).errorMessage = "An unknown error occurred loading the catalog. If you understand JavaScript, see the developer console"
				}
				
				(window as any).catalogError = error
				console.log("The error encountered can be inspected here by referring to it as catalogError (a property of the window object):")
				console.log(error.message)
			})
		},
		data(): Object {
			return {
				tracks: [] as string[],
				errorMessage: ""
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
