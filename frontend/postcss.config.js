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
	console.log("skipping cssnano in development mode")
	module.exports.plugins.pop();
} else {
	console.log("hello production build from postcss config!")
}
