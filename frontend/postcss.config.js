module.exports = {
	plugins: [
		require('tailwindcss')('./tailwind.js'),
		require('autoprefixer'),
		require("cssnano")({
			preset: ['default', {
				discardComments: {
					removeAll: true,
				},
			}]
		}),
	],
};

if (process.env.NODE_ENV !== "production") {
	console.log("hello, presumably, development build from postcss config!")
	module.exports.plugins.pop();
	module.exports.plugins.pop();
} else {
	console.log("hello production build from postcss config!")
}
