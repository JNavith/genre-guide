/*
    genre.guide - Design system information JavaScript file
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


const { sineIn, sineInOut, sineOut } = require("svelte/easing");


module.exports = {
	colors: {
		green: {
			100: "#E7F8E6",
			200: "#CFF1CC",
			300: "#87DD80",
			400: "#57CF4D",
			500: "#0FBB00",
			600: "#009802",
			700: "#007808",
			800: "#00570E",
		},
	},

	easingFunctions: {
		smoothIn: sineIn,
		smoothOut: sineOut,
		smoothInOut: sineInOut,
	},

	fontFamily: {
		heading: ["Poppins", "Roboto"],
		body: ["Roboto"],
	},

	fontMagicianConfig: {
		display: "swap",
		foundries: ["custom", "google"],
		formats: ["local", "otf", "woff2", "woff", "eot", "svg", "ttf"],
		custom: {},
	},

	themes: ["light", "dark"],

	transitionDurations: {
		short: {
			default: 200,
			opacity: 250,
			transform: 120,
		},
	},

	transitionFunctions: {
		fadeSlide(
			node,
			{
				delay = 0,
				opacityDuration = 500,
				opacityEasing = (t) => t,
				translateXPercent = 0,
				translateYPercent = 100,
				transformDuration = 500,
				transformEasing = (t) => t,
			},
		) {
			const opacity = Number(getComputedStyle(node).opacity);

			const maxDuration = Math.max(opacityDuration, transformDuration);

			return {
				delay,
				duration: maxDuration,
				css: (t) => {
					const opacityTime = Math.min(t * (maxDuration / opacityDuration), 1);
					const opacityTimeEased = opacityEasing(opacityTime);

					const transformTime = Math.min(t * (maxDuration / transformDuration), 1);
					const transformTimeEased = transformEasing(transformTime);

					return `opacity: ${opacityTimeEased * opacity};
			  transform: translate(${translateXPercent *
						(1 - transformTimeEased)}%, ${translateYPercent * (1 - transformTimeEased)}%)`;
				},
			};
		},
	},
};
