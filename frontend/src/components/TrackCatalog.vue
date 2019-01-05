<template>
	<table class="w-full mb-12 text-left" style="border-collapse: separate; border-spacing: 0.625rem">
		<thead class="font-header text-lg-responsive text-grey-dark">
			<tr>
				<th class="font-light">Release Date</th>
				<th class="font-light"></th>
				<th class="font-light">Song and Artist</th>
				<th class="font-light">Record Label</th>
				<th class="font-light">Subgenres</th>
			</tr>
		</thead>
		<template v-for="(trackList, dateIndex) in Array.from(tracksByDate.values())">
			<!-- Hack to imitate padding / margin in a table-->
			<tr class="h-8" v-if="dateIndex > 0"></tr>
			<!-- Border -->
			<tr class="h-1 bg-grey-light">
				<td colspan="5"></td>
			</tr>
			<!-- Hack to imitate padding / margin in a table-->
			<tr class="h-3"></tr>
			
			<template v-for="(track, index) in trackList">
				<TrackEntry :key="track.id" v-bind="track" :index="getTrackNumberInList(trackList, index)" />
			</template>
		</template>
	</table>
</template>

<script lang="js">
	import TrackEntry from "./TrackEntry"
	import Vue from 'vue';
	
	function dateObjToString(date) {
		return date.year + " " + date.month_name + " " + date.day
	}
	
	export default Vue.extend({
		name: "TrackCatalog",
		components: {TrackEntry},
		computed: {
			tracksByDate() {
				const map = this.tracks.reduce((map, nextTrack) => {
					const asString = dateObjToString(nextTrack.date);
					
					if (map.get(asString) === undefined) {
						nextTrack.showDate = true;
						map.set(asString, [nextTrack]);
					} else {
						nextTrack.showDate = false;
						map.get(asString).push(nextTrack)
					}
					return map
				}, new Map([]));
				
				return map
			}
		},
		methods: {
			getTrackNumberInList: function (trackList, index) {
				for (let [date, candidateTrackList] of this.tracksByDate) {
					if (trackList === candidateTrackList) {
						const groupIndex = Array.from(this.tracksByDate.keys()).indexOf(date);
						
						let trackNumber = index;
						for (let i = 0; i < groupIndex; i++) {
							trackNumber += Array.from(this.tracksByDate.values())[i].length
						}
						
						return trackNumber
					}
				}
			}
		},
		props: {
			tracks: {
				type: Array,
				required:
					true
			}
		}
	})
</script>

<style scoped>
</style>
