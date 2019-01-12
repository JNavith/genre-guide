const glob = require('glob');

const PurgecssPlugin = require('purgecss-webpack-plugin');

class TailwindExtractor {
	static extract(content) {
		return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
	}
}

const siteName = "genre.guide"
const author = "Navith"

const baseMeta = {
	author: author,
	"og:image": "/img/1x1-logo.png",
	"twitter:card": "summary",
	"twitter:site": siteName,
	"twitter:image:alt": siteName
}


const pages = {
	index: {
		entry: "src/pages/catalog.ts",
		fileName: "catalog.html",
		title: `Catalog - ${siteName}`,
		meta: {
			...baseMeta,
			description: "Learn about genres by their history, characteristics, and examples",
		},
	},
	
	about: {
		entry: "src/pages/about.ts",
		fileName: "about.html",
		title: `About ${siteName}`,
		meta: {
			...baseMeta,
			description: `How we make ${siteName}`,
		}
	},
	
	subgenre: {
		entry: "src/pages/subgenre.ts",
		fileName: "subgenre.html",
		title: `Subgenre - ${siteName}`,
		meta: {
			...baseMeta,
			description: "Learn about a particular subgenre and see examples of it in particular tracks"
		}
	}
};

// For now, the catalog page is basically the index
pages.catalog = {
	...pages.index,
	meta: {
		...pages.index.meta,
		description: "Browse the catalog of songs with identified subgenres",
	}
}

// Derive duplicated (basically) meta properties from the originally defined ones
for (let page of Object.values(pages)) {
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
