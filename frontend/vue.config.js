const path = require('path');
const glob = require('glob');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
		entry: {
			// tailwind: './tailwind.postcss',
			catalogTs: './src/pages/catalog.ts',
			catalogVue: './src/pages/Catalog.vue',
		},
		mode: process.env.NODE_ENV,
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader',
				},
				{
					test: /\.vue$/,
					loader: 'vue-loader',
				},
				{
					test: /\.postcss$/,
					use: [
						// 'css-hot-loader',
						// MiniCssExtractPlugin.loader,
						// "css-loader",
						'vue-style-loader',
						"postcss-loader",
					],
				},
			],
		},
		plugins: [
			new VueLoaderPlugin(),
			
			// new MiniCssExtractPlugin({
			// 	filename: 'css/[name].css',
			// 	chunkFilename: "[id].css"
			// }),
			
			new PurgecssPlugin({
				paths: glob.sync(`./src/**/*.vue`, {nodir: true}),
				extractors: [
					{
						extractor: TailwindExtractor,
						extensions: ['vue']
					},
				],
			}),
		],
		resolve: {
			alias: {
				vue$: 'vue/dist/vue.common.js',
			},
			extensions: [".ts", ".tsx", ".js", ".vue"],
		},
		output: {
			filename: "[name].js"
		}
	}
};


if (process.env.NODE_ENV !== "production") {
	console.log("hello what I assume is a development build from vue config!")
	// Exclude purgecss from dev builds
	module.exports.configureWebpack.plugins.pop();
} else {
	console.log("hello production build from vue config!")
}
