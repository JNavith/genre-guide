module.exports = {
	plugins: [
		require('tailwindcss')('./tailwind.config.js'),
		require('postcss-nested')({
			bubble: ['screen', 'variants'],
		}),
		require('autoprefixer'),
		...process.env.NODE_ENV === "production" ? [require("cssnano")({
			preset: ['default', {
				discardComments: {
					removeAll: true,
				},
			}]
		})] : [],
	],
};
