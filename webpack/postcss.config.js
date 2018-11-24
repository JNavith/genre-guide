module.exports = {
	plugins: [
		require('tailwindcss')('./tailwind.js'), 
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
	module.exports.plugins.pop();
}
