<template>
	<tr class="align-middle" :style="fadeIn ? {visibility: show ? 'visible' : 'hidden', transition: 'opacity 250ms ease-in, transform 120ms cubic-bezier(0,0,0,1)', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(-200%)'} : {}">
		<!-- Date (only on first entry in group) -->
		<td :class="showDate ? ['align-top', 'font-header', 'font-light', 'bg-white', 'sticky pin-t'] : []">
			<div class="pt-2 pr-6" v-if="showDate">
				<p class="text-2xl-responsive text-grey-dark leading-none">{{ date.year }}</p>
				<p class="text-xl-responsive text-grey">{{ date.monthName }} {{ date.day }}</p>
			</div>
		</td>
		<!-- End date -->
		
		<!-- Artwork -->
		<td>
			<img v-if="image !== null" :src="image" :alt="name" class="h-12 w-12 shadow-sm" />
			<track-art-missing v-else class="h-12 w-12 shadow-sm" :color-background="hexColors[0][0]" :color-foreground="hexColors[0][1]"></track-art-missing>
		</td>
		<!-- End artwork -->
		
		<!-- Title and artist -->
		<td>
			<p class="text-lg-responsive font-thin text-black-light leading-tight">{{ name }}</p>
			<p class="text-md-responsive font-thin text-grey-dark">{{ artist }}</p>
		</td>
		<!-- End title and artist -->
		
		<!-- Record label -->
		<td><p class="text-lg-responsive font-thin text-grey-dark">{{ recordLabel }}</p></td>
		<!-- End record label -->
		
		<!-- Subgenres -->
		<td>
			<TrackSubgenres :subgenres="subgenres" :tailwind-colors="tailwindColors" />
		</td>
		<!-- End subgenres -->
	</tr>
</template>

<script lang="ts">
	// @ts-ignore
	import TrackSubgenres from "./TrackSubgenres"
	// @ts-ignore
	import TrackArtMissing from "./TrackArtMissing"
	
	import Vue from 'vue';
	
	
	export default Vue.extend({
		name: "TrackEntry",
		components: {TrackSubgenres, TrackArtMissing},
		computed: {
			subgenresWithTailwindColors(): string[][] {
				return JSON.parse(this.subgenresWithTailwindColorsJSON)
			},
			subgenresWithHexColors(): string[][] {
				return JSON.parse(this.subgenresWithHexColorsJSON)
			},
			subgenres(): string[] {
				return this.subgenresWithTailwindColors[0]
			},
			tailwindColors(): string[] {
				return this.subgenresWithTailwindColors[1]
			},
			hexColors(): string[] {
				return this.subgenresWithHexColors[1]
			},
		},
		created: function () {
			// Delayed fade-in based on index
			let thisComponent = this;
			setTimeout(function () {
				thisComponent.show = true
			}, (1 + Math.sqrt(this.index)) * 100)
		},
		data: function () {
			return {
				show: false
			}
		},
		props: {
			showDate: {
				type: Boolean,
				required: true,
				default: true,
			},
			
			date: {
				type: Object,
				required: false,
			},
			
			image: {
				type: String,
				required: false,
				default: null,
			},
			
			name: {
				type: String,
				required: true,
			},
			
			artist: {
				type: String,
				required: true,
			},
			
			recordLabel: {
				type: String,
				required: true,
			},
			
			subgenresWithHexColorsJSON: {
				type: String,
				required: false,
				default: "[[], []]",
			},
			
			subgenresWithTailwindColorsJSON: {
				type: String,
				required: false,
				default: "[[], []]",
			},
			
			index: {
				type: Number,
				required: false,
				default: 0
			},
			fadeIn: {
				type: Boolean,
				required: false,
				default: true
			}
		}
	})
</script>

<style scoped>
</style>
