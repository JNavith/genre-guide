<!--
    genre.guide - Error page Svelte route
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
	// @ts-ignore
	import Metadata from "../components/Renderless/Metadata.svelte";
	// @ts-ignore
	import AccentBar from "../components/AccentBar.svelte";

	export let status: string;
	export let error: Error;

	// @ts-ignore
	const dev = process.env.NODE_ENV === "development";
</script>

<Metadata
	pageTitle="{error.message} ({status})"
	description="You've come across an error. This is so sad" />

<AccentBar />

<main class="flex-1 flex flex-col items-center justify-center text-center">
	<h1
		class="font-medium font-heading text-4xl sm:text-5xl md:text-6xl
		theme-light:text-green-700 theme-dark:text-green-300 uppercase">
		{error.message}
	</h1>
	<p
		class="font-medium text-3xl sm:text-4xl md:text-5xl
		theme-light:text-green-600 theme-dark:text-green-400">
		{status}
	</p>

	<a
		class="mt-16 text-xl sm:text-2xl md:text-3xl theme-light:text-green-400
		theme-light:hover:text-green-500 theme-dark:text-green-600
		theme-dark:hover:text-green-500"
		href="/">
		return to the homepage
	</a>

	{#if dev && error.stack}
		<pre>{error.stack}</pre>
	{/if}
</main>

<AccentBar />
