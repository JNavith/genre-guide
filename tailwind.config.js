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

const { lch } = require("d3-color");
const defaultConfig = require("tailwindcss/defaultConfig");
const newTailwindColorsConfig = require("tailwindcss/lib/flagged/uniformColorPalette").default;
const tailwindcssCustomNative = require("tailwindcss-custom-native");
const tailwindcssGradients = require("tailwindcss-gradients");
const tailwindcssLeadingTrim = require("tailwindcss-leading-trim");
const {
	tailwindcssThemeVariants,
	focus, hover, prefersDark, prefersLight, groupHover, groupFocus, selection,
} = require("tailwindcss-theme-variants");

const colors = require("./src/node_modules/design-system/colors");

const newTailwindColors = newTailwindColorsConfig.theme.colors;
const { theme: defaultTheme, variants: defaultVariants } = defaultConfig;

const [_, l, c, h] = colors.green[400].match(/lch\(([.\d]+) ([.\d]+) ([.\d]+)\)/);
// eslint-disable-next-line camelcase
const green_400_70 = lch(l, c, h, 0.70);
// eslint-disable-next-line camelcase
const black_70 = lch(0, 0, 0, 0.70);
// eslint-disable-next-line camelcase
const white_70 = lch(100, 0, 0, 0.70);

// eslint-disable-next-line camelcase
const shadowOutlineGreen = `0 0 0 3px ${green_400_70}`;
// eslint-disable-next-line camelcase
const shadowOutlineBlack = `0 0 0 3px ${black_70}`;
// eslint-disable-next-line camelcase
const shadowOutlineWhite = `0 0 0 3px ${white_70}`;

/** @type{import("@navith/tailwindcss-plugin-author-types").TailwindCSSConfig} */
const tailwindcssConfig = {
	theme: {
		colors: {
			transparent: "transparent",
			current: "currentColor",
			inherit: "inherit",
			black: newTailwindColors.black,
			white: newTailwindColors.white,
			gray: newTailwindColors.gray,
			...colors,
		},

		borderColor: {
			transparent: "transparent",
			current: "currentColor",
			gray: newTailwindColors.gray,
		},

		extend: {
			borderSpacing: { 4: "1rem" },

			boxShadow: {
				outline: shadowOutlineGreen,
				"outline-black": shadowOutlineBlack,
				"outline-white": shadowOutlineWhite,
				"outline-with-lg": `${defaultTheme.boxShadow.lg}, ${shadowOutlineGreen}`,
				"white-glow": `0 0 8px 4px ${newTailwindColors.white}`,
				"gray-900-glow": `0 0 8px 4px ${newTailwindColors.gray[900]}`,
			},

			customUtilities: {
				borderSpacing: {},
			},

			fontSize: {
				"7xl": "5rem",
				"8xl": "6rem",
				"9xl": "7rem",
			},

			minWidth: (theme_) => theme_("spacing"),

			spacing: {
				7: "1.75rem",
				9: "2.25rem",
				72: "18rem",
				96: "24rem",
				128: "32rem",
			},
		},

		fontFamily: {
			heading: ["Inter", ...defaultTheme.fontFamily.sans],
			body: ["Inter", ...defaultTheme.fontFamily.sans],
		},

		linearGradientColors: {
			day: ["lch(91 32.612 203.866)", "lch(68 50.636 276.408)"],
			night: ["lch(47 65.876 282)", "lch(40 70.572 290)", "lch(30 80 300)"],
		},

		radialGradientColors: {
			sun: ["lch(95 90.845 93.996)", "lch(93 98.845 85.996)"],
			moon: ["lch(87 0.702 18.519)", "lch(75 0.872 236.434)"],
		},
	},

	corePlugins: {
		backgroundOpacity: false,
		borderOpacity: false,
		divideColor: false,
		divideOpacity: false,
		divideWidth: false,
		placeholderColor: false,
		placeholderOpacity: false,
		skew: false,
		textOpacity: false,
		transformOrigin: false,
		transitionDelay: false,
	},

	variants: {
		backgroundColor: [
			...defaultVariants.backgroundColor,
			"themes",
			"themes:hover",
			"themes:focus",
			"themes:selection",
			"selection:important",
		],
		borderColor: [...defaultVariants.borderColor, "group-hover", "group-focus"],
		boxShadow: [...defaultVariants.boxShadow, "themes", "themes:focus"],
		textColor: [
			...defaultVariants.textColor,
			"themes",
			"themes:hover",
			"themes:focus",
			"themes:group-focus",
			"themes:group-hover",
			"themes:selection",
			"selection:important",
		],
	},

	plugins: [
		tailwindcssCustomNative,
		tailwindcssGradients,
		tailwindcssLeadingTrim,

		tailwindcssThemeVariants({
			group: "themes",
			baseSelector: "html",
			fallback: "light-theme",
			themes: {
				"light-theme": { selector: "[data-theme=light]", mediaQuery: prefersLight },
				"dark-theme": { selector: "[data-theme=dark]", mediaQuery: prefersDark },
			},
			variants: {
				focus,
				"group-focus": groupFocus,
				"group-hover": groupHover,
				hover,
				selection,
			},
		}),

		({ addVariant, e }) => {
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

	experimental: {
		applyComplexClasses: true,
	},

	future: {
		removeDeprecatedGapUtilities: true,
	},

	purge: false,
};

module.exports = tailwindcssConfig;
