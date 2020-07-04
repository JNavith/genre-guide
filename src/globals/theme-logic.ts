/*
	genre.guide - Theme logic JavaScript file
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
*/

import { derived, get, writable } from "svelte/store";

import mediaMatcher from "./media-matcher";
import localStore from "./local-store";

export type Theme = "light" | "dark";
const defaultTheme = "light";

// Server rendering will use these default values
const theme = localStore<Theme>("theme", defaultTheme);
const systemTheme = localStore<boolean>("system-theme", true);
const systemThemeSupported = writable(false);

// @ts-ignore -- doesn't exist until @rollup/plugin-replace makes it
if (process.browser) {
	const light = mediaMatcher("(prefers-color-scheme: light)");
	const dark = mediaMatcher("(prefers-color-scheme: dark)");

	const computedTheme = derived([light, dark], ([$light, $dark]) => {
		if ($light) return "light";
		if ($dark) return "dark";
		return undefined;
	});

	const allUnsubscribes = [
		computedTheme.subscribe(($computedTheme) => {
			systemThemeSupported.set($computedTheme !== undefined);

			if (get(systemTheme)) {
				theme.set($computedTheme ?? defaultTheme);
			}
		}),
		systemTheme.subscribe(($systemTheme) => {
			if ($systemTheme) {
				theme.set(get(computedTheme) ?? defaultTheme);
			}
		}),
		theme.subscribe((($theme) => {
			if ($theme) document.documentElement.setAttribute("data-theme", $theme);
			else document.documentElement.removeAttribute("data-theme");
		})),
	];

	const unsubscribeAll = () => {
		allUnsubscribes.forEach((unsubscribe) => unsubscribe());
	};
}

export { theme, systemTheme, systemThemeSupported };

// Just get things running without asking for anything in particular
export default undefined;
