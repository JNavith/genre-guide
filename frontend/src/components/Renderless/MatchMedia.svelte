<!--
    genre.guide - matchMedia renderless Svelte component
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


<script lang="typescript">
	import { onMount } from "svelte";

	export let query: string;

	// @ts-ignore
	const mediaQueryList: MediaQueryList = matchMedia(query);
	export let matches: boolean = mediaQueryList.matches;

	interface HandlerOptions {
		matches: boolean;
	}
	const handler = (options: HandlerOptions) => {
		matches = options.matches;
	};

	onMount(() => {
		mediaQueryList.addListener(handler);

		return () => {
			mediaQueryList.removeListener(handler);
		};
	});
</script>

<slot {matches} />
