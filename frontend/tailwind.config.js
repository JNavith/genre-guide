/*
    genre.guide - Tailwind configuration file
    Copyright (C) 2020 Navith

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

View the full documentation at https://tailwindcss.com.

*/

const {theme: defaultTheme, variants: defaultVariants} = require("tailwindcss/defaultConfig");
const {colors, fontFamily, themes} = require("./src/globals/design-system");

module.exports = {
	theme: {
		extend: {
			borderColor: {default: "currentColor"},

			borderSpacing: {"4": "1rem"},

			boxShadow: (theme) => ({
				"outline": "0 0 0 3px hsla(121, 100%, 30%, 0.625)",
				"outline-with-lg": `${defaultTheme.boxShadow.lg}, 0 0 0 3px hsla(121, 100%, 30%, 0.625)`,
				"white-glow": `0 0 8px 4px ${theme("colors.white")}`,
				"gray-900-glow": `0 0 8px 4px ${theme("colors.gray.900")}`,
			}),

			colors: {
				"transparent": "transparent",
				"current": "currentColor",
				"inherit": "inherit",
				...colors,
			},

			customUtilities: {
				"borderSpacing": {},
			},

			minWidth: (theme) => theme("spacing"),

			spacing: {
				"7": "1.75rem",
				"9": "2.25rem",
				"72": "18rem",
				"96": "24rem",
				"128": "32rem",
			},
		},

		fontFamily: {
			heading: [...fontFamily.heading, ...defaultTheme.fontFamily.sans],
			body: [...fontFamily.body, ...defaultTheme.fontFamily.sans],
		},

		linearGradientColors: (theme) => ({
			"teal-300-blue-400": [theme("colors.teal.300"), theme("colors.blue.400")],
			"indigo-700-purple-900": [theme("colors.indigo.700"), theme("colors.purple.900")],
		}),

		radialGradientColors: (theme) => ({
			"yellow-200-orange-300": [theme("colors.yellow.300"), theme("colors.orange.300")],
			"gray-100-gray-200": [theme("colors.gray.100"), theme("colors.gray.200")],
		}),

		themes,
	},

	corePlugins: {placeholderColor: false},

	variants: {
		backgroundColor: [
			...defaultVariants.backgroundColor,
			"selection",
			"selection:important",
			"theme-light",
			"theme-light:hover",
			"theme-light:focus",
			"theme-light:active",
			"theme-dark",
			"theme-dark:hover",
			"theme-dark:focus",
			"theme-dark:active",
		],
		boxShadow: [...defaultVariants.boxShadow, "theme-light", "theme-dark"],
		cursor: [...defaultVariants.cursor, "hover"],
		textColor: [
			...defaultVariants.textColor,
			"selection",
			"selection:important",
			"theme-light",
			"theme-light:hover",
			"theme-light:focus",
			"theme-light:active",
			"theme-dark",
			"theme-dark:hover",
			"theme-dark:focus",
			"theme-dark:active",
		],
	},

	plugins: [
		require("@tailwindcss/ui"),
		require("tailwindcss-custom-native"),
		require("tailwindcss-gradients"),

		// Add theme variants
		({addVariant, e, theme}) => {
			theme("themes", []).forEach((themeName) => {
				// Default / unprefixed variant
				addVariant(`theme-${themeName}`, ({modifySelectors, separator}) => modifySelectors(({className}) => `.${e(`theme-${themeName}`)} .${e(`theme-${themeName}${separator}${className}`)}`));

				// Hover, focus, and active variants
				["hover", "focus", "active"].forEach((regularVariant) => {
					addVariant(
						`theme-${themeName}:${regularVariant}`,
						({modifySelectors, separator}) => modifySelectors(({className}) => `.${e(`theme-${themeName}`)} .${e(`theme-${themeName}${separator}${regularVariant}${separator}${className}`)}:${regularVariant}`),
					);
				});
			});
		},

		// Add selection variant
		({addVariant, e}) => {
			addVariant("selection", ({modifySelectors, separator}) => {
				modifySelectors(({className}) => {
					const selectionClassName = e(`selection${separator}${className}`);

					return `.${selectionClassName}::selection, .${selectionClassName} ::selection`;
				});
			});
		},

		// Add important selection variant
		({addVariant, e}) => {
			addVariant("selection:important", ({container, modifySelectors, separator}) => {
				container.walkRules((rule) => {
					rule.walkDecls((decl) => {
						decl.important = true;
					});
				});

				modifySelectors(({className}) => {
					const selectionClassName = e(`selection${separator}!${className}`);
					return `.${selectionClassName}::selection, .${selectionClassName} ::selection`;
				});
			});
		},
	],
};
