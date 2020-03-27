<!--
    genre.guide - Catalog page Svelte route
    Copyright (C) 2020 Navith

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
-->


<script context="module">
  import api from "../globals/api";

  const TRACK_FRAGMENT = `
		artist
		date
		id
		image
		name
		recordLabel
		subgenresFlat {
			... on Subgenre {
				names
				textColor
				backgroundColor
			}
			... on Operator {
				symbol
			}
		}
	`;

  const GET_MOST_RECENT_TRACKS = `
		{
			tracks {
				${TRACK_FRAGMENT}
			}
		}
	`;

  const GET_TRACKS_BEFORE_ID = `
		query getTracks($beforeId: ID!) {
			tracks(before_id: $beforeId) {
				${TRACK_FRAGMENT}
			}
		}
	`;

  export async function preload() {
    if (!process.browser) return;

    console.log("hi from me");
    const {
      data: { tracks }
    } = await api({ fetch: this.fetch, query: GET_MOST_RECENT_TRACKS });

    tracks.forEach((track, loadIndex) => {
      track.loadIndex = loadIndex;
    });

    console.log("bye from me");
    console.log({ tracks });

    return { tracks };
  }
</script>

<script>
  import { routes } from "../globals/site";

  import Metadata from "../components/Renderless/Metadata.svelte";
  import NavigationBarTopLevel from "../components/NavigationBarTopLevel.svelte";
  import TrackCatalog from "../components/TrackCatalog.svelte";
  import AccentBar from "../components/AccentBar.svelte";
  import MusicVisualizerLoader from "../components/MusicVisualizerLoader.svelte";

  const {
    catalog: { pageTitle, description }
  } = routes;

  export let tracks = [];

  // TODO: robot3 finite state machine
  let isLoadingTracks = false;
</script>

<svelte:window
  on:scroll|passive={async () => {
    if (isLoadingTracks) return;

    isLoadingTracks = false;
  }} />

<Metadata {pageTitle} {description} />

<AccentBar />

<NavigationBarTopLevel />

<main class="flex-1 flex flex-col items-center px-8">
  <TrackCatalog {tracks} />

  <div class="flex items-center justify-center my-4">
    <MusicVisualizerLoader />
  </div>
</main>

<AccentBar />
