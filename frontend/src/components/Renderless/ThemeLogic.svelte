<!--
    genre.guide - Theme logic renderless Svelte component
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
	import { themes } from "../../globals/design-system";
	import { writable } from "svelte/store";
	// @ts-ignore
	import LocalStorage from "./LocalStorage.svelte";
	// @ts-ignore
	import MatchMedia from "./MatchMedia.svelte";

	let light: boolean;
	let dark: boolean;

	export let theme = writable<undefined | "light" | "dark">(undefined);
	export let systemTheme = writable<undefined | boolean>(undefined);
	export let systemThemeSupported: undefined | boolean = undefined;

	// @ts-ignore
	$: if (light !== undefined && dark !== undefined) {
		systemThemeSupported = light || dark;
	}

	// @ts-ignore
	$: if (process.browser) {
		themes.forEach((themeName: string) => {
			// @ts-ignore
			if (themeName == $theme)
				// @ts-ignore
				document.documentElement.classList.add(`theme-${themeName}`);
			else
				// @ts-ignore
				document.documentElement.classList.remove(`theme-${themeName}`);
		});
	} 
	// @ts-ignore
	else console.warn("ThemeLogic being used outside of the browser -- this is not ok");

	// @ts-ignore
	$: if ($systemTheme) {
		// @ts-ignore
		if (light) $theme = "light";
		// @ts-ignore
		else if (dark) $theme = "dark";
	}
</script>

<MatchMedia query="(prefers-color-scheme: light)" bind:matches={light} />
<MatchMedia query="(prefers-color-scheme: dark)" bind:matches={dark} />

<LocalStorage key="theme" initial="light" bind:store={theme} />
<LocalStorage key="system-theme" initial={true} bind:store={systemTheme} />
