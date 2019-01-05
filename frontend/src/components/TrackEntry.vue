<template>
	<tr class="align-middle" :style="fadeIn ? {visibility: show ? 'visible' : 'hidden', transition: 'opacity 250ms ease-in, transform 120ms cubic-bezier(0,0,0,1)', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(-200%)'} : {}">
		<!-- Date (only on first entry in group) -->
		<td :class="track.showDate ? ['align-top', 'font-header', 'font-light', 'bg-white', 'sticky pin-t'] : []">
			<div class="pt-2 pr-6" v-if="track.showDate">
				<p class="text-2xl-responsive text-grey-dark leading-none">{{ track.date.year }}</p>
				<p class="text-xl-responsive text-grey">{{ track.date.month_name }} {{ track.date.day }}</p>
			</div>
		</td>
		<!-- End date -->
		
		<!-- Artwork -->
		<td>
			<img :src="track.image" :alt="track.name" class="h-12 w-12 shadow-sm" />
		</td>
		<!-- End artwork -->
		
		<!-- Title and artist -->
		<td>
			<p class="text-lg-responsive font-thin text-black-light leading-tight">{{ track.name }}</p>
			<p class="text-md-responsive font-thin text-grey-dark">{{ track.artist }}</p>
		</td>
		<!-- End title and artist -->
		
		<!-- Record label -->
		<td><p class="text-lg-responsive font-thin text-grey-dark">{{ track.record_label }}</p></td>
		<!-- End record label -->
		
		<!-- Subgenres -->
		<td>
			<TrackSubgenres :subgenresAndColors="JSON.parse(track.subgenres_with_colors_json)" />
		</td>
		<!-- End subgenres -->
	</tr>
</template>

<script lang="js">
	import TrackSubgenres from "./TrackSubgenres"
	import Vue from 'vue';
	
	export default Vue.extend({
		name: "TrackEntry",
		components: {TrackSubgenres},
		created: function () {
			let comp = this;
			setTimeout(function () {
				comp.show = true
			}, (1 + Math.sqrt(this.index)) * 100)
		},
		data: function () {
			return {
				show: false
			}
		},
		props: {
			track: {
				type: Object,
				required: true
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
