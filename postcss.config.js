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

const cssnano = require("cssnano");
const postcssEasingGradients = require("postcss-easing-gradients");
const postcssFontMagician = require("postcss-font-magician");
const postcssImport = require("postcss-import");
const postcssPresetEnv = require("postcss-preset-env");
const postcssPurgecss = require("@fullhuman/postcss-purgecss");
const tailwindcss = require("tailwindcss");
const tailwindcssConfig = require("./tailwind.config");

const mode = process.env.NODE_ENV;
const dev = mode === "development";

module.exports = {
	plugins: [
		postcssImport,

		tailwindcss(tailwindcssConfig),

		postcssPresetEnv({
			features: {
				"lab-function": { preserve: true },
			},
		}),

		postcssEasingGradients({ colorMode: "lch" }),

		postcssFontMagician({
			display: "swap",
			foundries: ["custom", "google"],
			formats: ["local", "otf", "woff2", "woff", "eot", "svg", "ttf"],
			custom: {},
		}),

		!dev && postcssPurgecss({
			content: ["./src/**/*.svelte", "./src/**/*.svx", "./src/**/*.html"],
			defaultExtractor: (content) => [...content.matchAll(/(?:class:)*([\w\d-/:%.!]+)/gm)].map(([_match, group, ..._rest]) => group),
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
