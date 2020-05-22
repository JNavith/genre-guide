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

/* eslint-disable global-require */
const mode = process.env.NODE_ENV;
const dev = mode === "development";

module.exports = {
	plugins: [
		require("postcss-import"),

		require("tailwindcss")("./tailwind.config.js"),

		require("postcss-preset-env")({
			features: {
				// https://github.com/tailwindcss/tailwindcss/issues/1190
				"focus-within-pseudo-class": false,
			},
		}),

		require("postcss-font-magician")(require("./src/globals/design-system").fontMagicianConfig),

		!dev && require("@fullhuman/postcss-purgecss")({
			content: ["./src/**/*.svelte", "./src/**/*.html"],
			defaultExtractor: (content) => [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(([_match, group, ..._rest]) => group),
			whitelist: ["theme-light", "theme-dark"],
		}),

		!dev && require("cssnano")({
			preset: [
				"default",
				{ discardComments: { removeAll: true } },
			],
		}),
	],
};
