<!--
    genre.guide - Homepage Svelte route
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


<script lang="typescript" context="module">
	export async function preload() {
		// @ts-ignore
		return (this as any).redirect(302, "/catalog");
	}
</script>

<script lang="typescript">
	import { onMount } from "svelte";
	// @ts-ignore
	import { goto } from "@sapper/app";

	// @ts-ignore
	import { description } from "../globals/site";

	// @ts-ignore
	import Metadata from "../components/Renderless/Metadata.svelte";

	onMount(() => goto("/catalog"));
</script>

<Metadata {description} />
