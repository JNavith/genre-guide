<!--
	genre.guide - About page Svelte route
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

	import Metadata from "../../components/Renderless/Metadata.svelte";
	import NavigationBar from "./_NavigationBar.svelte";
	
	import technologies from "./_technologies";

	import { routes } from "../../globals/site";
</script>

<Metadata title={routes.about.title} description={routes.about.description} />

<div class="absolute w-full min-h-screen flex flex-col selection:!text-white selection:!bg-black">
	<NavigationBar />

	<ul class="flex-1 flex flex-col">
		{#each technologies as Technology}
			<Technology />
		{/each}
	</ul>
</div>
