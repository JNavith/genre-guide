const glob = require('glob');

const PurgecssPlugin = require('purgecss-webpack-plugin');

class TailwindExtractor {
	static extract(content) {
		return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
	}
}

let index = {
	entry: 'src/pages/catalog.ts',
	fileName: 'catalog.html'
};

module.exports = {
	pages: {
		index,
		catalog: index,
	},
	configureWebpack: {
		plugins: [
			new PurgecssPlugin({
				paths: [
					...glob.sync(`./src/**/*.vue`, {nodir: true}),
					...glob.sync(`./src/**/*.html`, {nodir: true}),
					...glob.sync(`./public/index.html`, {nodir: true}),
				],
				extractors: [
					{
						extractor: TailwindExtractor,
						extensions: ['vue', 'html']
					},
				],
			}),
		],
	}
};


if (process.env.NODE_ENV !== "production") {
	console.log("hello what I assume is a development build from vue config!")
	// Exclude purgecss from dev builds
	console.log("skipping purgecss in development mode")
	module.exports.configureWebpack.plugins.pop();
} else {
	console.log("hello production build from vue config!")
}
