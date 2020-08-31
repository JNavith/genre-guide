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

import { spawn } from "child_process";
import { performance } from "perf_hooks";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import colors from "kleur";
import smartAsset from "rollup-plugin-smart-asset";
import { terser } from "rollup-plugin-terser";
import progress from "rollup-plugin-progress";
import visualizer from "rollup-plugin-visualizer";
import config from "sapper/config/rollup";
import pkg from "./package.json";

const { createPreprocessors } = require("./svelte.config");

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const sourcemap = dev ? "inline" : false;
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const ONLY_GRAPHQL_SERVER = !!process.env.ONLY_GRAPHQL_SERVER; // eslint-disable-line prefer-destructuring
const PORT = process.env.PORT || 3000; // eslint-disable-line prefer-destructuring

const preprocess = createPreprocessors({ sourceMap: !!sourcemap });

const smartAssetConfig = {
	url: "inline",
	sourceMap: sourcemap,
	publicPath: "/",
	useHash: true,
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
			typescript({
				noEmitOnError: false,
				sourceMap: !!sourcemap,
			}),
			json(),
			smartAsset(smartAssetConfig),

			(() => {
				let builder;
				const buildGlobalCSS = () => {
					if (builder) return;
					const start = performance.now();

					try {
						builder = spawn("node", ["--unhandled-rejections=strict", "build-global-css.mjs", sourcemap]);
						builder.stdout.pipe(process.stdout);
						builder.stderr.pipe(process.stderr);
						builder.on("close", (code) => {
							if (code === 0) {
								const elapsed = parseInt(performance.now() - start, 10);
								console.log(`${colors.bold().green("✔ global css")} (src/global.pcss → static/global.css${sourcemap === true ? " + static/global.css.map" : ""}) ${colors.gray(`(${elapsed}ms)`)}`);
							} else if (code !== null) {
								console.error(`global css builder exited with code ${code}`);
								console.log(colors.bold().red("✗ global css"));
							}
							builder = undefined;
						});
					} catch (err) {
						console.log(colors.bold().red("✗ global css"));
						console.error(err);
					}
				};

				return {
					name: "build-global-css",
					buildStart() {
						buildGlobalCSS();
						this.addWatchFile("postcss.config.js");
						this.addWatchFile("tailwind.config.js");
						this.addWatchFile("src/global.pcss");
						this.addWatchFile("src/base.pcss");
						this.addWatchFile("src/utilities.pcss");
					},
					generateBundle: buildGlobalCSS,
				};
			})(),

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

			dev && progress(),
			dev && visualizer({
				title: "Client side bundle",
				filename: "./.tmp/client-stats.html",
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
			typescript({
				noEmitOnError: false,
				sourceMap: !!sourcemap,
			}),
			json(),
			smartAsset(smartAssetConfig),

			dev && progress(),
		],
		external: Object.keys(pkg.dependencies).concat(
			require("module").builtinModules || Object.keys(process.binding("natives")), // eslint-disable-line global-require
		),

		preserveEntrySignatures: "strict",
		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input().replace(/\.js$/, ".ts"),
		output: { ...config.serviceworker.output(), sourcemap },
		plugins: [
			resolve(),
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
			}),
			commonjs(),
			typescript({
				noEmitOnError: false,
				sourceMap: !!sourcemap,
			}),
			!dev && terser(),

			dev && progress(),
		],

		preserveEntrySignatures: false,
		onwarn,
	},
};
