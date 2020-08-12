/*
	genre.guide - Web manifest file
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

import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

import { lch } from "d3-color";

// @ts-ignore -- need to write types for it
import { colors } from "design-system";
import { name, description } from "site";

const [_, l, c, h] = colors.green[500].match(/lch\(([.\d]+) ([.\d]+) ([.\d]+)\)/);
// eslint-disable-next-line camelcase
const green_500 = lch(l, c, h);
// eslint-disable-next-line camelcase
const theme_color = green_500.hex();

const MANIFEST = {
	short_name: name,
	name,
	description,
	categories: [
		"music",
	],
	lang: "en-US",
	dir: "ltr",
	icons: [
		{
			src: "logo-192.png",
			sizes: "192x192",
			type: "image/png",
			purpose: "any maskable",
		},
		{
			src: "logo-512.png",
			sizes: "512x512",
			type: "image/png",
			purpose: "any maskable",
		},
	],
	start_url: "/",
	display: "standalone",
	background_color: "#FFFFFF",
	theme_color,
	screenshots: [
		{
			src: "screenshot-1.png",
			sizes: "1280x720",
			type: "image/png",
		},
		{
			src: "screenshot-2.png",
			sizes: "1280x720",
			type: "image/png",
		},
	],
};

export const get = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
	res.json(MANIFEST);
};
