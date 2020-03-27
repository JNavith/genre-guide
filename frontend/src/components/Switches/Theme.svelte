<!--
    genre.guide - Theme switch Svelte component
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
	import Binary from "../Renderless/Binary.svelte";
	// @ts-ignore
	import { themes } from "../../globals/design-system";

	export let state: "light" | "dark";
	export let disabled: boolean;
</script>

<Binary options={themes} bind:state let:toggle>
	<div
		class="ml-2 w-10 h-5 rounded-full"
		on:click={() => {
			if (!disabled) toggle();
		}}
		on:keydown={({ key }) => {
			if (!disabled && key == 'Enter') toggle();
		}}
		tabindex="0"
		title={state}>

		{#each themes as outer}
			<div
				class="rounded-full w-10 h-5 absolute transition-opacity {state == outer ? 'opacity-100' : 'opacity-0'}
				{disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
				{outer === 'dark' ? 'bg-gradient-t-indigo-700-purple-900' : 'bg-gradient-t-teal-300-blue-400'}">

				{#each themes as inner}
					<div
						class="block w-3 h-3 ml-1 mt-1 rounded-full absolute
						left-0 top-0 transition-all {inner === 'dark' ? 'bg-radial-gray-100-gray-200' : 'bg-radial-yellow-200-orange-300'}
						{state === 'dark' ? 'ml-6' : 'mr-6'}
						{state === inner ? 'opacity-100' : 'opacity-0'}" />
				{/each}

				<!-- Need an empty div that the inner part of the button can have a right margin against -->
				<div />
			</div>
		{/each}
	</div>
</Binary>
