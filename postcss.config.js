/*
    genre.guide - PostCSS configuration file
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

import cssnano from "cssnano";
import postcssImport from "postcss-import";
import postcssFontMagician from "postcss-font-magician";
import postcssPresetEnv from "postcss-preset-env";
import postcssPurgecss from "@fullhuman/postcss-purgecss";
import tailwindcss from "tailwindcss";
import * as tailwindcssConfig from "./tailwind.config";

import { fontMagicianConfig } from "./src/globals/design-system";

const mode = process.env.NODE_ENV;
const dev = mode === "development";

export default {
	plugins: [
		postcssImport,

		tailwindcss(tailwindcssConfig),

		postcssPresetEnv({
			features: {
				// https://github.com/tailwindcss/tailwindcss/issues/1190
				"focus-within-pseudo-class": false,
			},
		}),

		postcssFontMagician(fontMagicianConfig),

		!dev && postcssPurgecss({
			content: ["./src/**/*.svelte", "./src/**/*.html"],
			defaultExtractor: (content) => [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(([_match, group, ..._rest]) => group),
			whitelist: ["data-theme"],
		}),

		!dev && cssnano({
			preset: [
				"default",
				{ discardComments: { removeAll: true } },
			],
		}),
	].filter(Boolean),
};
