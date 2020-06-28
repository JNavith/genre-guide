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

import {
	quartIn, quartInOut, quartOut, sineIn, sineInOut, sineOut,
} from "svelte/easing";
import { fade } from "svelte/transition";

export const colors = {
	green: {
		 50: "lch(98 7.243 143.882)",
		100: "lch(95 11.066 142.581)",
		200: "lch(91 22.792 141.398)",
		300: "lch(83 57.966 139.523)",
		400: "lch(71 78.851 137.606)",
		500: "lch(58 94.427 135.673)",
		600: "lch(45 81.143 136.151)",
		700: "lch(40 67.126 136.907)",
		800: "lch(31 50.851 139.065)",
		900: "lch(26 36.111 140.584)",
	},
};

export const easingFunctions = {
	smooth: {
		in: sineIn,
		out: sineOut,
		inOut: sineInOut,
	},
	smoother: {
		in: quartIn,
		out: quartOut,
		inOut: quartInOut,
	},
};

export const fontFamily = {
	heading: ["Poppins", "Roboto"],
	body: ["Roboto"],
};

export const fontMagicianConfig = {
	display: "swap",
	foundries: ["custom", "google"],
	formats: ["local", "otf", "woff2", "woff", "eot", "svg", "ttf"],
	custom: {},
};

export const transitionDurations = {
	short: 200,
	medium: 300,
};

export const transitionFunctions = {
	fade,
};
