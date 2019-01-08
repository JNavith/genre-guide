<template>
	<table class="w-full mb-12 text-left" style="border-collapse: separate; border-spacing: 0.625rem">
		<thead class="font-header text-lg-responsive text-grey-dark">
			<tr>
				<th class="font-light min-w-28 lg:min-w-40">Release Date</th>
				<th class="font-light"></th>
				<th class="font-light min-w-32 xl:min-w-128 xxl:min-w-192">Song and Artist</th>
				<th class="font-light xl:min-w-48 hidden lg:table-cell">Record Label</th>
				<th class="font-light xl:min-w-96">Subgenres</th>
			</tr>
		</thead>
		<template v-for="(trackList, dateIndex) in Array.from(tracksByDate.values())">
			<!-- Hack to imitate padding / margin in a table -->
			<tr class="h-8" v-if="dateIndex > 0"></tr>
			<!-- Border -->
			<tr class="h-1 bg-grey-light">
				<td colspan="5"></td>
			</tr>
			<!-- Hack to imitate padding / margin in a table-->
			<tr class="h-3"></tr>
			
			<TrackEntry v-for="track in trackList" :key="track.id" v-bind="track" />
		</template>
	</table>
</template>

<script lang="js">
	import TrackEntry from "./TrackEntry"
	import Vue from 'vue';
	
	function dateObjToString(date) {
		return date.year + " " + date.monthName + " " + date.day
	}
	
	export default Vue.extend({
		name: "TrackCatalog",
		components: {TrackEntry},
		data() {
			return {
				tracksByDate: new Map([])
			}
		},
		methods: {
			updateTracks: function (tracksAddedThisTime) {
				for (let track of this.tracks.slice(this.tracks.length - tracksAddedThisTime, this.tracks.length)) {
					const asString = dateObjToString(track.date);
					
					if (this.tracksByDate.get(asString) === undefined) {
						track.showDate = true;
						this.tracksByDate.set(asString, [track])
					} else {
						track.showDate = false;
						this.tracksByDate.get(asString).push(track)
					}
				}
				
				this.$forceUpdate();
			},
		},
		props: {
			tracks: {
				type: Array,
				required: true,
				default: [],
			}
		},
	})
</script>

<style scoped>
</style>
