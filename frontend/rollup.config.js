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


import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import config from "sapper/config/rollup.js";
import json from "@rollup/plugin-json";
import pkg from "./package.json";
import { preprocess } from "@pyoner/svelte-ts-preprocess";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = Boolean(process.env.SAPPER_LEGACY_BUILD);

const ignoredCircularDependencies = [
	"node_modules/@apollo/protobufjs/src/util/minimal.js",
	"node_modules/apollo-server-core/dist/index.js",
	"node_modules/apollo-server-core/dist/runHttpQuery.js",
	"node_modules/apollo-server-express/node_modules/apollo-server-core/dist/index.js",
	"node_modules/apollo-server-express/node_modules/apollo-server-core/dist/runHttpQuery.js",
	"node_modules/glob/glob.js",
	"node_modules/graphql-tools/dist/generate/index.js",
	"node_modules/ioredis/built/redis/index.js",
	"node_modules/protobufjs/src/util/minimal.js",
	"node_modules/type-graphql/dist/errors/index.js",
];

const warningIsIgnored = (warning) => warning.message.includes(
	"Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",
) || ignoredCircularDependencies.some((posixPath) => ([posixPath, posixPath.replace(/\//g, "\\")].some((path) => (warning.message.includes(`Circular dependency: ${path} ->`)))));

const onwarn = (warning, onwarn_) => {
	if (warningIsIgnored(warning)) return;
	if (warning.code === "CIRCULAR_DEPENDENCY") if (/[/\\]@sapper[/\\]/.test(warning.message)) return;

	onwarn_(warning);
};

const dedupe = (importee) => importee === "svelte" || importee.startsWith("svelte/");

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
			}),
			svelte({
				dev,
				hydratable: true,
				emitCss: true,
				preprocess: preprocess(),
			}),
			resolve({
				mainFields: ["module", "main", "browser"],
				dedupe,
			}),
			commonjs(),
			typescript(),
			json(),

			legacy &&
			babel({
				extensions: [".js", ".mjs", ".html", ".svelte"],
				runtimeHelpers: true,
				exclude: ["node_modules/@babel/**"],
				presets: [
					[
						"@babel/preset-env",
						{ targets: "> 0.25%, not dead" },
					],
				],
				plugins: [
					"@babel/plugin-syntax-dynamic-import",
					[
						"@babel/plugin-transform-runtime",
						{ useESModules: true },
					],
				],
			}),

			!dev &&
			terser({ module: true }),
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				"process.browser": false,
				"process.env.NODE_ENV": JSON.stringify(mode),
				"module.require": "require",
			}),
			svelte({
				generate: "ssr",
				dev,
				preprocess: preprocess(),
			}),
			json(),
			resolve({
				dedupe,
				mainFields: ["module", "main"],
				extensions: [".mjs", ".js", ".json", ".node", ".ts"],
			}),
			typescript(),
			commonjs({
				extensions: [".js", ".ts"],
				namedExports: { "type-graphql": ["Arg", "Args", "ArgsType", "buildSchema", "createUnionType", "Field", "FieldResolver", "ID", "Int", "ObjectType", "Query", "registerEnumType", "Resolver", "ResolverInterface", "Root"] },
			}),
		],
		external: Object.keys(pkg.dependencies).concat(
			require("module").builtinModules || Object.keys(process.binding("natives")),
		),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode),
			}),
			commonjs(),
			!dev && terser(),
		],

		onwarn,
	},
};
