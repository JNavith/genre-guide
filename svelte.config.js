const { mdsvex } = require("mdsvex");
const remarkAbbr = require("remark-abbr");
const sveltePreprocess = require("svelte-preprocess");

const postcssConfig = require("./postcss.config");

const createPreprocessors = ({ sourceMap }) => [
	sveltePreprocess({
		defaults: {
			script: "typescript",
			style: "postcss",
		},
		postcss: {
			...postcssConfig,
			sourceMap,
		},
		typescript: {
			sourceMap,
		},
	}),
	mdsvex({
		layout: {
			_technologies: "./src/routes/about/_technologies/_layout.svx",
		},
		remarkPlugins: [remarkAbbr],
	}),
];

module.exports = {
	createPreprocessors,
	preprocess: createPreprocessors({ sourceMap: true }),
};
