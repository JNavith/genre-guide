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
	import { indexOf } from "lodash-es";
	import Binary from "../Renderless/Binary.svelte";

	const states = ["light", "dark"];
	export let state: "light" | "dark" | undefined;
	export let disabled;

	const toggle = () => {
		const nextState = (indexOf(states, state) + 1) % states.length;
		state = states[nextState]; 
	}
</script>

<button
	class="ml-2 w-10 h-5 rounded-full relative"
	on:click={toggle}
	title={state}
	aria-pressed={state === states[states.length - 1]}
	{disabled}>

	{#each states as outer}
		<div
			class="rounded-full w-10 h-5 transition-opacity absolute inset-0
			{state == outer ? 'opacity-100' : 'opacity-0'}
			{disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
			{outer === 'dark' ? 'bg-gradient-t-indigo-700-purple-900' : 'bg-gradient-t-teal-300-blue-400'}">

			{#each states as inner}
				<div
					class="block w-3 h-3 ml-1 mt-1 rounded-full absolute inset-0
					left-0 top-0 transition-all {inner === 'dark' ? 'bg-radial-gray-100-gray-200' : 'bg-radial-yellow-300-orange-300'}
					{state === 'dark' ? 'ml-6' : 'mr-6'}
					{state === inner ? 'opacity-100' : 'opacity-0'}" />
			{/each}

			<!-- Need an empty div that the inner part of the button can have a right margin against -->
			<div />
		</div>
	{/each}
</button>
