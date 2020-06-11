/*
    genre.guide - Svelte VS Code IntelliSense configuration file
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

import sveltePreprocess from "svelte-preprocess";
import postcss from "./postcss.config";

const dev = process.env.NODE_ENV === "development";

export const preprocess = sveltePreprocess({
	postcss,
	typescript: {
		// This returns compilation times back to what they're like without TypeScript
		// And still type checks for production builds
		// Use IDE tools for type checking during development instead
		transpileOnly: dev,
	},
});
