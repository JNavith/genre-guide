<!--
    genre.guide - Sitewide page layout Svelte file
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
    import { getContext, setContext } from "svelte";

    import themeLogic from "../globals/theme-logic";
    
	// `segment` will create a warning if not expected: https://github.com/sveltejs/sapper-template/issues/210
	// https://github.com/sveltejs/sapper/issues/824
	export let segment: string = "";
	// Silence unused export property warning
    if (segment) {};
</script>

<style lang="postcss" global>
	@import "../global.pcss";
</style>

<slot />
