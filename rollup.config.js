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
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup";
import pkg from "./package.json";
import { preprocess as sveltePreprocessConfig } from "./svelte.config";

const preprocess = [
	sveltePreprocessConfig,
];

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const sourcemap = dev ? "inline" : false;
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const warningIsIgnored = (warning) => warning.message.includes(
	"Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",
) || warning.message.includes("Circular dependency: node_modules");

// Workaround for https://github.com/sveltejs/sapper/issues/1221
const onwarn = (warning, _onwarn) => (warning.code === "CIRCULAR_DEPENDENCY" && /[/\\]@sapper[/\\]/.test(warning.message)) || warningIsIgnored(warning) || console.warn(warning.toString());

export default {
	client: {
		input: config.client.input().replace(/\.js$/, ".ts"),
		output: { ...config.client.output(), sourcemap },
		plugins: [
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true,
				preprocess,
			}),
			resolve({
				browser: true,
				dedupe: ["svelte"],
			}),
			commonjs(),
			typescript(),
			json(),

			legacy && babel({
				extensions: [".js", ".mjs", ".html", ".svelte"],
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
				"module.require": "require",
			}),
			svelte({
				generate: "ssr",
				dev,
				preprocess,
			}),
			resolve({
				dedupe: ["svelte"],
			}),
			commonjs(),
			typescript(),
			json(),
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
