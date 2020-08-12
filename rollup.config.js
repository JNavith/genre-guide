/*
    genre.guide - Rollup configuration file
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

import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import smartAsset from "rollup-plugin-smart-asset";
import { terser } from "rollup-plugin-terser";
import { mdsvex } from "mdsvex";
import remarkAbbr from "remark-abbr";
import config from "sapper/config/rollup";
import sveltePreprocess from "svelte-preprocess";
import pkg from "./package.json";
import * as postcss from "./postcss.config";

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const sourcemap = dev ? "inline" : false;
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const ONLY_GRAPHQL_SERVER = !!process.env.ONLY_GRAPHQL_SERVER; // eslint-disable-line prefer-destructuring
const PORT = process.env.PORT || 3000; // eslint-disable-line prefer-destructuring

const { defaults } = require("./svelte.config.js");

const preprocess = [
	sveltePreprocess({ defaults, postcss }),
	mdsvex({
		layout: {
			_technologies: "./src/routes/about/_technologies/_layout.svx",
		},
		remarkPlugins: [remarkAbbr],
	}),
];

const smartAssetConfig = {
	url: "inline",
	sourceMap: sourcemap,
	publicPath: "/",
};

const warningIsIgnored = (warning) => warning.message.includes(
	"Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",
) || warning.message.includes("Circular dependency: node_modules")
  || warning.message.includes("The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten");

// Workaround for https://github.com/sveltejs/sapper/issues/1221
const onwarn = (warning, _onwarn) => (warning.code === "CIRCULAR_DEPENDENCY" && /[/\\]@sapper[/\\]/.test(warning.message)) || warningIsIgnored(warning) || console.warn(warning.toString());

export default {
	client: {
		input: config.client.input().replace(/\.js$/, ".ts"),
		output: { ...config.client.output(), sourcemap },
		plugins: ONLY_GRAPHQL_SERVER ? [] : [
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
				"process.env.ONLY_GRAPHQL_SERVER": JSON.stringify(ONLY_GRAPHQL_SERVER),
				"process.env.PORT": JSON.stringify(dev ? PORT : undefined),
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true,
				extensions: [
					".svelte",
					".svx",
				],
				preprocess,
			}),
			resolve({
				browser: true,
				dedupe: ["svelte"],
			}),
			commonjs(),
			typescript(),
			json(),
			smartAsset(smartAssetConfig),

			legacy && babel({
				extensions: [".js", ".mjs", ".html", ".svelte", ".svx"],
				babelHelpers: "runtime",
				exclude: ["node_modules/@babel/**"],
				presets: [
					["@babel/preset-env", {
						targets: "> 0.25%, not dead",
					}],
				],
				plugins: [
					"@babel/plugin-syntax-dynamic-import",
					["@babel/plugin-transform-runtime", {
						useESModules: true,
					}],
				],
			}),

			!dev && terser({
				module: true,
			}),
		],

		preserveEntrySignatures: false,
		onwarn,
	},

	server: {
		input: { server: config.server.input().server.replace(/\.js$/, ".ts") },
		output: { ...config.server.output(), sourcemap },
		plugins: [
			replace({
				"process.browser": false,
				"process.env.NODE_ENV": JSON.stringify(mode),
				"process.env.ONLY_GRAPHQL_SERVER": JSON.stringify(ONLY_GRAPHQL_SERVER),
				"module.require": "require",
			}),
			svelte({
				generate: "ssr",
				dev,
				extensions: [
					".svelte",
					".svx",
				],
				preprocess,
			}),
			resolve({
				dedupe: ["svelte"],
			}),
			commonjs(),
			typescript(),
			json(),
			smartAsset(smartAssetConfig),
		],
		external: Object.keys(pkg.dependencies).concat(
			require("module").builtinModules || Object.keys(process.binding("natives")), // eslint-disable-line global-require
		),

		preserveEntrySignatures: "strict",
		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input().replace(/\.js$/, ".ts"),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
			}),
			commonjs(),
			typescript(),
			!dev && terser(),
		],

		preserveEntrySignatures: false,
		onwarn,
	},
};
