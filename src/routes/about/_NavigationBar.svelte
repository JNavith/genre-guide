<!--
		genre.guide - About page navigation bar Svelte component
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
	import { routes, name as siteName } from "../../globals/site";

	import { send, receive } from "../_navigation-bar-crossfade";

	import AccentBar from "./_AccentBar.svelte";
</script>

<nav
	style="background-color: #23A566"
	in:receive={{ key: 'nav' }}
	out:send={{ key: 'nav' }}>

	<AccentBar />

	<div class="flex justify-between items-center py-3 sm:py-4 md:py-6">

		<!-- Left side: site name -->
		<div
			class="mr-2">

			<a
				class="block ml-3 sm:ml-4 md:ml-6 text-lg sm:text-xl md:text-2xl
				font-heading font-medium text-white border-b-2 border-transparent hover:border-current focus:border-current"
				href="/"
				title="{siteName} homepage"
				rel="prefetch">

				<span class="opacity-75 inline-block"
					in:receive={{ key: 'site-name-modifier' }}
					out:send={{ key: 'site-name-modifier' }}>

					how we make
				</span>
				
				<span class="inline-block"
					in:receive={{ key: 'site-name' }}
					out:send={{ key: 'site-name' }}>
					
					{siteName}
				</span>
			</a>
		</div>

		<!-- Right side -->
		<div
			class="ml-2 flex items-center"
			in:receive={{ key: 'right-nav' }}
			out:send={{ key: 'right-nav' }}>

			{#each Object.entries(routes) as [smallTitle, { route, description }]}
				<a
					class="block mr-3 sm:mr-4 md:mr-6 text-md sm:text-lg md:text-xl
					font-heading text-white border-b-2 border-transparent hover:border-current focus:border-current"
					href={route}
					title={description}
					rel="prefetch">
					{smallTitle}
				</a>
			{/each}

			<div class="w-6 sm:w-7 md:w-10" />
		</div>
	</div>
</nav>
