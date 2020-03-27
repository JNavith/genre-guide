<!--
    genre.guide - Music visualizer styled loader Svelte component
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

<div class="line-scale-pulse-out-rapid h-24 flex items-center">
	{#each Array(5) as _}
		<div
			class="theme-light:bg-gray-300 theme-dark:bg-gray-600 rounded-full
			mx-1 w-2" />
	{/each}
</div>
