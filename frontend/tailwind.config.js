/*
    genre.guide - Tailwind Configuration File
    Copyright (C) 2018 Navith

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

/*

Tailwind - The Utility-First CSS Framework

A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).

Welcome to the Tailwind config file. This is where you can customize
Tailwind specifically for your project. Don't be intimidated by the
length of this file. It's really just a big JavaScript object and
we've done our very best to explain each section.

View the full documentation at https://tailwindcss.com.


|-------------------------------------------------------------------------------
| The default config
|-------------------------------------------------------------------------------
|
| This variable contains the default Tailwind config. You don't have
| to use it, but it can sometimes be helpful to have available. For
| example, you may choose to merge your custom configuration
| values with some of the Tailwind defaults.
|
*/

const defaultConfig = require('tailwindcss/defaultConfig');

// Yes, we are really blocking the main thread. I have a good reason.
const request = require('sync-request');

// Query the GraphQL server for all the genre colors
const genreColors = (() => {
	const result = request('POST', 'http://graphql-server/graphql', {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		json: {
			query: `{
				all_genres {
					color {
						tw: background(representation: TAILWIND)
						hex: background(representation: HEX)
					}
				}
			}`
		}
	});
	
	const genreColors = {};
	
	// Parse out the colors and update the genreColors object from them
	JSON.parse(result.getBody('utf8')).data.all_genres.forEach(({color}) => {
		genreColors[color.tw] = color.hex
	});
	
	console.log(genreColors);
	
	return genreColors
})();


const originalColors = {
	'transparent': 'transparent',
	'current-color': 'currentColor',
	
	'genre-this': 'var(--genre-this-color)',
	
	'black': '#000000',
	'white': '#ffffff',
	
	'gray': {
		...defaultConfig.theme.colors.gray,
	},
	
	'green': {
		'darker': '#00570E',
		'dark': '#009802',
		default: '#0FBB00'
	}
};


module.exports = {
	theme: {
		backgroundColor: theme => theme('colors'),
		
		borderColor: theme => ({
			default: theme('colors.current-color'),
			...theme('colors'),
		}),
		
		boxShadow: {
			...defaultConfig.theme.boxShadow,
			'white-glow': '0 -4px 8px 4px white',
		},
		
		colors: Object.assign(originalColors, genreColors),
		
		fill: {
			'current-color': 'currentColor',
		},
		
		fontFamily: {
			...defaultConfig.theme.fontFamily,
			'header': ['Poppins', ...defaultConfig.theme.fontFamily.sans],
			'sans': ['Heebo', ...defaultConfig.theme.fontFamily.sans],
		},
		
		fontSize: {
			...defaultConfig.theme.fontSize,
			'md': '1rem',
			'6xl': '4rem',
			'8xl': '4.5rem',
		},
		
		height: theme => ({
			...theme('spacing'),
			'auto': 'auto',
			'128': '32rem',
			'full': '100%',
			'screen': '100vh'
		}),
		
		inset: {
			'0': '0',
			'4': '1rem',
		},
		
		margin: theme => ({
			...theme('spacing'),
			auto: 'auto',
		}),
		
		minHeight: {
			...defaultConfig.theme.minHeight,
			'48': '12rem',
		},
		
		minWidth: {
			...defaultConfig.theme.minWidth,
			'8': '2rem',
			'16': '4rem',
			'28': '7rem',
			'32': '8rem',
			'40': '10rem',
			'48': '12rem',
			'64': '16rem',
			'128': '32rem',
			'192': '48rem',
			'256': '64rem',
		},
		
		negativeMargin: theme => theme('spacing'),
		
		opacity: {
			...defaultConfig.theme.opacity,
			'5': '.05',
			'80': '.80',
		},
		
		padding: theme => theme('spacing'),
		
		spacing: {
			...defaultConfig.theme.spacing,
			'72': '18rem',
		},
		
		screens: {
			...defaultConfig.theme.screens,
			'xxl': '1600px',
		},
		
		stroke: {
			'current-color': 'currentColor',
		},
		
		textColor: theme => theme('colors'),
		
		width: theme => ({
			...theme('spacing'),
			auto: 'auto',
			'full': '100%',
			'screen': '100vw'
		}),
		
		zIndex: {
			...defaultConfig.theme.zIndex,
			'neg1': -1,
		},
	},
	
	variants: {
		alignContent: ['responsive'],
		alignItems: ['responsive'],
		alignSelf: ['responsive'],
		appearance: [],
		backgroundAttachment: [],
		backgroundColor: ['responsive', 'hover', 'focus', 'active', 'selection'],
		backgroundPosition: ['responsive'],
		backgroundRepeat: ['responsive'],
		backgroundSize: ['responsive'],
		borderCollapse: [],
		borderColor: ['responsive', 'hover', 'focus', 'active'],
		borderRadius: ['responsive'],
		borderStyle: ['responsive'],
		borderWidth: ['responsive'],
		boxShadow: ['responsive', 'hover', 'focus', 'active'],
		cursor: ['responsive'],
		display: ['responsive'],
		fill: [],
		flex: ['responsive'],
		flexDirection: ['responsive'],
		flexGrow: ['responsive'],
		flexShrink: ['responsive'],
		flexWrap: ['responsive'],
		float: [],
		fontFamily: ['responsive'],
		fontSize: ['responsive'],
		fontWeight: ['responsive'],
		height: ['responsive'],
		inset: ['responsive'],
		justifyContent: ['responsive'],
		letterSpacing: ['responsive'],
		lineHeight: ['responsive'],
		listStylePosition: ['responsive'],
		listStyleType: ['responsive'],
		margin: ['responsive'],
		maxHeight: ['responsive'],
		maxWidth: ['responsive'],
		minHeight: ['responsive'],
		minWidth: ['responsive'],
		negativeMargin: ['responsive', 'hover'],
		opacity: ['responsive', 'hover'],
		outline: ['focus'],
		overflow: ['responsive'],
		padding: ['responsive'],
		pointerEvents: ['responsive'],
		position: ['responsive'],
		resize: ['responsive'],
		stroke: [],
		tableLayout: ['responsive'],
		textAlign: ['responsive'],
		textColor: ['responsive', 'hover', 'focus', 'active', 'selection'],
		fontSmoothing: [],
		fontStyle: ['responsive', 'hover', 'focus', 'active'],
		textDecoration: ['hover', 'focus', 'active'],
		textTransform: [],
		userSelect: ['responsive'],
		verticalAlign: ['responsive'],
		visibility: ['responsive'],
		whitespace: ['responsive'],
		wordBreak: ['responsive'],
		width: ['responsive'],
		zIndex: ['responsive'],
	},
	
	corePlugins: {
		appearance: false,
		container: false,
		float: false,
	},
	
	plugins: [
		require('tailwindcss-transition')({
			standard: 'all .3s ease',
			transitions: {
				'slow': 'all 2s ease',
			}
		}),
		
		require("tailwindcss-typography")({
			variants: [],
			textShadows: {
				"default": "0 4px 8px hsla(0deg, 0%, 0%, 0.12)",
			},
		}),
		
		// Container replacement
		(function ({screens}) {
				return function ({addComponents, config}) {
					const subcomponents = {maxWidth: screens.default};
					const screenConfig = config("theme.screens", []);
					
					for (let [screen, maxWidth] of Object.entries(screens)) {
						if (screen === "default") continue;
						
						subcomponents[`@media (min-width: ${screenConfig[screen]})`] = {maxWidth}
					}
					
					addComponents({".container": subcomponents});
				}
			}
		)({
			screens: {
				"default": "none",
				"sm": "30rem",
				"md": "40rem",
				"lg": "60rem",
				"xl": "70rem",
			}
		}),
		
		// Add selection variant
		function ({addVariant, e}) {
			addVariant('selection', ({modifySelectors, separator}) => {
				modifySelectors(({className}) => {
					return `.${e(`selection${separator}${className}`)}::selection, .${e(`selection${separator}${className}`)} ::selection`
				})
			})
		},
	],
};
