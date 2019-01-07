const glob = require('glob');

const PurgecssPlugin = require('purgecss-webpack-plugin');

class TailwindExtractor {
	static extract(content) {
		return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
	}
}

const siteName = "genre.guide"

let pages = {
	index: {
		entry: "src/pages/catalog.ts",
		fileName: "catalog.html",
		title: `Catalog - ${siteName}`,
		meta: {
			description: "Learn about genres by their history, characteristics, and examples",
			author: "Navith",
			"og:image": "img/1x1-logo.png",
			"twitter:card": "summary_large_image",
			"twitter:site": siteName,
			"twitter:image:alt": siteName
		},
	},
};

pages.catalog = {
	...pages.index,
	meta: {
		...pages.index.meta,
		description: "Browse the catalog of songs with identified subgenres",
	}
}

for (let page in Object.values(pages)) {
	page.meta["og:title"] = page.title
	page.meta["og:description"] = page.meta.description
	page.meta["twitter:title"] = page.title
	page.meta["twitter:description"] = page.meta.description
	page.meta["twitter:creator"] = page.meta.author
	page.meta["twitter:image"] = page.meta["og:image"]
}

module.exports = {
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
	},
	integrity: process.env.NODE_ENV === "production",
	pages: pages
};


if (process.env.NODE_ENV !== "production") {
	console.log("hello what I assume is a development build from vue config!")
	// Exclude purgecss from dev builds
	console.log("skipping purgecss in development mode")
	module.exports.configureWebpack.plugins.pop();
} else {
	console.log("hello production build from vue config!")
}
