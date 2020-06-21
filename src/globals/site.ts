/*
    genre.guide - (Web)site configuration JavaScript file
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

const PORT = process.env.PORT; // eslint-disable-line prefer-destructuring
const mode = process.env.NODE_ENV;
const dev = mode === "development";

export const author = "Navith";
export const name = "the genre guide";
export const description = "Learn about genres by their history, characteristics, and examples";
export const domain = dev ? `http://localhost:${PORT}` : "https://genre-guide.web.app";

export const repository = "https://github.com/SirNavith/genre.guide";
export const discord = "https://discord.gg/z5W6Cpd";

export const routes = {
	catalog: {
		route: "/catalog",
		pageTitle: "Catalog",
		description: "Browse the catalog of songs with identified subgenres",
	},
	about: {
		route: "/about",
		title: `How we make ${name}`,
		description: "Explore the technology and community that makes this site possible",
	},
};
