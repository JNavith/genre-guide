<template>
	<div class="font-sans min-h-screen flex flex-col relative">
		<div class="h-1 bg-green"></div>
		<the-header :link-inactive="'green'" :link-active="'green-dark'"></the-header>
		<main class="flex flex-1 justify-center">
			<div class="mt-8 px-8">
				<transition name="fade-slow">
					<track-catalog :tracks="tracks" v-if="tracks !== undefined && tracks.length > 0"></track-catalog>
					<div class="fixed pin-x flex flex-col justify-center items-center text-grey" style="top: 40vh" v-else>
						<div class="flex flex-1 w-full justify-center items-center">
							<line-scale-pulse-out-rapid-loader size="50px" color="#B8C2CC"></line-scale-pulse-out-rapid-loader>
						</div>
						<p class="mt-6 text-2xl-responsive">The catalog is loading</p>
					</div>
				</transition>
			</div>
		</main>
		<div class="h-1 bg-green"></div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue"
	import request from "graphql-request";
	import TheHeader from "../components/TheHeader.vue";
	import TrackCatalog from '../components/TrackCatalog.vue';
	
	import 'vue-loaders/dist/vue-loaders.css';
	// @ts-ignore
	import {LineScalePulseOutRapidLoader} from 'vue-loaders';
	
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
				const thisAny = this as any;
				thisAny.tracks = (data as any).tracks as Object[];
				thisAny.lastTrack = thisAny.tracks[thisAny.tracks.length - 1]
			})
		},
		data(): Object {
			return {
				tracks: [] as string[]
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
