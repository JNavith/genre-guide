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


import tailwindui from "@tailwindcss/ui";
import tailwindcssCustomNative from "tailwindcss-custom-native";
import tailwindcssGradients from "tailwindcss-gradients";

import defaultConfig from "tailwindcss/defaultConfig";
import tailwindcssThemeVariants, {
	active, focus, hover, prefersDark, prefersLight,
} from "tailwindcss-theme-variants";
import { colors, fontFamily } from "./src/globals/design-system";

const { theme: defaultTheme, variants: defaultVariants } = defaultConfig;


export default {
	purge: false,
	theme: {
		extend: {
			borderColor: { default: "currentColor" },

			borderSpacing: { 4: "1rem" },

			boxShadow: (theme) => ({
				outline: "0 0 0 3px hsla(121, 100%, 30%, 0.625)",
				"outline-with-lg": `${defaultTheme.boxShadow.lg}, 0 0 0 3px hsla(121, 100%, 30%, 0.625)`,
				"white-glow": `0 0 8px 4px ${theme("colors.white")}`,
				"gray-900-glow": `0 0 8px 4px ${theme("colors.gray.900")}`,
			}),

			colors: {
				transparent: "transparent",
				current: "currentColor",
				inherit: "inherit",
				...colors,
			},

			customUtilities: {
				borderSpacing: {},
			},

			minWidth: (theme) => theme("spacing"),

			spacing: {
				7: "1.75rem",
				9: "2.25rem",
				72: "18rem",
				96: "24rem",
				128: "32rem",
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
			"yellow-300-orange-300": [theme("colors.yellow.300"), theme("colors.orange.300")],
			"gray-100-gray-200": [theme("colors.gray.100"), theme("colors.gray.200")],
		}),
	},

	corePlugins: { placeholderColor: false },

	variants: {
		backgroundColor: [
			...defaultVariants.backgroundColor,
			"selection",
			"selection:important",
			"light-theme",
			"light-theme:hover",
			"light-theme:focus",
			"dark-theme",
			"dark-theme:hover",
			"dark-theme:focus",
		],
		boxShadow: [...defaultVariants.boxShadow, "light-theme", "dark-theme"],
		cursor: [...defaultVariants.cursor, "hover"],
		textColor: [
			...defaultVariants.textColor,
			"selection",
			"selection:important",
			"light-theme",
			"light-theme:hover",
			"light-theme:focus",
			"dark-theme",
			"dark-theme:hover",
			"dark-theme:focus",
		],
	},

	plugins: [
		tailwindui,
		tailwindcssCustomNative,
		tailwindcssGradients,

		tailwindcssThemeVariants({
			baseSelector: "html",
			fallback: "light",
			rename: (themeName) => `${themeName}-theme`,
			themes: {
				light: { selector: "[data-theme=light]", mediaQuery: prefersLight },
				dark: { selector: "[data-theme=dark]", mediaQuery: prefersDark },
			},
			variants: {
				hover,
				focus,
				active,
			},
		}),

		({ addVariant, e }) => {
			// Add selection variant
			addVariant("selection", ({ modifySelectors, separator }) => {
				modifySelectors(({ className }) => {
					const selectionClassName = e(`selection${separator}${className}`);

					return `.${selectionClassName}::selection, .${selectionClassName} ::selection`;
				});
			});

			// Add important selection variant
			addVariant("selection:important", ({ container, modifySelectors, separator }) => {
				container.walkRules((rule) => {
					rule.walkDecls((decl) => {
						// eslint-disable-next-line no-param-reassign
						decl.important = true;
					});
				});

				modifySelectors(({ className }) => {
					const selectionClassName = e(`selection${separator}!${className}`);
					return `.${selectionClassName}::selection, .${selectionClassName} ::selection`;
				});
			});
		},
	],
};
