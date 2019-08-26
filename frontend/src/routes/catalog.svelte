<script>
  import { get } from "svelte/store";
  import { sineIn } from "svelte/easing";
  import { fade } from "svelte/transition";
  import fetch from "node-fetch";
  import ApolloClient from "apollo-boost";
  import { query } from "svelte-apollo";
  import { FrownIcon } from "svelte-feather-icons";
  import { GET_MOST_RECENT_TRACKS, getTracksBefore } from "../queries";
  import { siteName } from "../stores";
  import TrackCatalog from "../components/TrackCatalog.svelte";

  const client = new ApolloClient({
    uri: "https://genre.guide/graphql",
    fetch
  });

  let innerHeight, scrollY;

  let tracks = [];
  let isLoadingTracks;

  const loadTracks = () => {
    if (isLoadingTracks) return;
    isLoadingTracks = true;

    let tracksRequestStore;
    let initialTrackLoad;

    if (tracks.length == 0) {
      tracksRequestStore = query(client, { query: GET_MOST_RECENT_TRACKS });
      // This is a promise so it can make the await block in the HTML work
      initialTrackLoad = new Promise((resolve, reject) =>
        tracksRequestStore.subscribe(tracksRequest =>
          tracksRequest.then(tracksResponse => resolve(undefined))
        )
      );
    } else {
      tracksRequestStore = query(client, {
        query: getTracksBefore(tracks[tracks.length - 1].id)
      });
    }

    tracksRequestStore.subscribe(tracksRequest =>
      tracksRequest.then(({ data: { tracks: newTracks } }) => {
        newTracks.forEach((track, loadIndex) => {
          track.loadIndex = loadIndex;
        });

        tracks = [...tracks, ...newTracks];
        isLoadingTracks = false;
      })
    );

    return initialTrackLoad;
  };

  const initialTrackLoad = loadTracks();
</script>

<style>
  /* https://github.com/ConnorAtherton/loaders.css */
  @keyframes line-scale-pulse-out-rapid {
    0%,
    100% {
      height: 6rem;
    }
    80% {
      height: 1rem;
    }
  }
  .line-scale-pulse-out-rapid > div {
    animation-fill-mode: both;
    display: inline-block;
    vertical-align: middle;
    animation: line-scale-pulse-out-rapid 0.9s 0s infinite
      cubic-bezier(0.11, 0.49, 0.38, 0.78);
  }
  .line-scale-pulse-out-rapid > div:nth-child(2),
  .line-scale-pulse-out-rapid > div:nth-child(4) {
    animation-delay: -0.25s !important;
  }
  .line-scale-pulse-out-rapid > div:nth-child(1),
  .line-scale-pulse-out-rapid > div:nth-child(5) {
    animation-delay: -0.5s !important;
  }
</style>

<svelte:head>
  <title>Catalog - {$siteName}</title>
</svelte:head>

<svelte:window
  bind:scrollY
  bind:innerHeight
  on:scroll|passive={() => {
    if (innerHeight * 3 + scrollY > document.body.offsetHeight) loadTracks();
  }} />
<svelte:body bind:offsetHeight />

<div
  in:fade={{ duration: 1250 }}
  class="flex flex-col flex-1 items-center justify-center px-8">
  {#if process.browser}
    {#await initialTrackLoad}
      <div class="flex flex-1 items-center justify-center my-4">
        <div class="line-scale-pulse-out-rapid h-24 flex items-center">
          <!-- This particular loader needs 5 children -->
          {#each Array(5) as _}
            <div
              class="theme-light:bg-gray-400 theme-dark:bg-gray-600 rounded-full
              mx-1 w-2" />
          {/each}
        </div>
      </div>
    {:then}
      <TrackCatalog {tracks} />
      <div class="flex flex-1 items-center justify-center my-4">
        <div class="line-scale-pulse-out-rapid h-24 flex items-center">
          {#each Array(5) as _}
            <div
              class="theme-light:bg-gray-400 theme-dark:bg-gray-600 rounded-full
              mx-1 w-2" />
          {/each}
        </div>
      </div>
    {:catch error}
      <div
        class="flex flex-col items-center text-lg theme-light:text-gray-500
        theme-dark:text-gray-600">
        <div class="w-6 h-6">
          <FrownIcon />
        </div>
        <span>
          {#if error.message === 'Network error: NetworkError when attempting to fetch resource.'}
            There was a network error caused by trying to load the catalog
          {:else if error.graphQLErrors !== undefined && error.graphQLErrors.length > 0}
            There was an error in the catalog response, which is probably out of
            your control
          {:else}
            {console.log(error) || console.log(Object.entries(error)) || 'An unknown error occurred loading the catalog. If you understand JavaScript, see the developer console to inspect what went wrong'}
          {/if}
        </span>
      </div>
    {/await}
  {/if}
</div>
