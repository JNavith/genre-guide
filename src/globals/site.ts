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

const mode = process.env.NODE_ENV;
const dev = mode === "development";

const SITE_NAME = "the genre guide";
const REPOSITORY = "https://github.com/SirNavith/genre.guide";
const DISCORD_INVITE_LINK = "https://discord.gg/z5W6Cpd";

export const author = "Navith";
export const name = SITE_NAME;
export const domain = dev ? "http://localhost:3000" : "https://genre-guide.web.app";
export const repository = REPOSITORY;
export const description = "Learn about genres by their history, characteristics, and examples";

export const routes = {
	catalog: {
		route: "/catalog",
		pageTitle: "Catalog",
		description: "Browse the catalog of songs with identified subgenres",
	},
	about: {
		route: "/about",
		title: `How we make ${SITE_NAME}`,
		description: "Explore the technology and community that makes this site possible",
	},
};

export const technologies = [
	{
		title: "The Genre Sheet",
		descriptionHtml: "All subgenre identifications and history come from years of work by the team working on the <a href=\"https://docs.google.com/spreadsheets/d/1xZUWWnll7HzDVmNj_W7cBfz9TTkl-fMMqHZ8derG-Dg\">Genre Sheet</a>, a publicly accessible Google Sheets spreadsheet.",
		colorBackground: "#23A566",
		colorForeground: "#E8FFF9",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/sheets.svg",
	},
	{
		title: "Tailwind CSS",
		descriptionHtml: "We use <a href=\"https://tailwindcss.com/\">Tailwind CSS</a>, and a set of other PostCSS plugins, to design and implement this website's layout and appearance.",
		colorBackground: "#38B2AC",
		colorForeground: "#E6FFFA",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/tailwindcss.svg",
	},
	{
		title: "Feather Icons",
		descriptionHtml: "We use icons from the <a href=\"https://feathericons.com/\">Feather</a> pack (through <a href=\"https://npmjs.com/package/svelte-feather-icons\">this Svelte library</a>) in a few places, like subgenre operators and for the settings menu.",
		colorBackground: "#0066FF",
		colorForeground: "#C2F0FF",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/feather.svg",
	},
	{
		title: "Discord",
		descriptionHtml: `Join us in discussion about ${SITE_NAME} and the Genre Sheet on <a href="${DISCORD_INVITE_LINK}">our Discord server</a>.`,
		colorBackground: "#7289DA",
		colorForeground: "#EBF5FF",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/discord.svg",
	},
	{
		title: "GraphQL",
		descriptionHtml: `${SITE_NAME}’s API is available over the GraphQL query language at <a href="/graphql">this endpoint</a>. <br /> Opening this link in the browser will bring you to the GraphQL Playground, where you can explore the schema and experiment building queries with autocompletion.`,
		colorBackground: "#E535AB",
		colorForeground: "#FDDFFF",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/graphql.svg",
	},
	{
		title: "Svelte",
		descriptionHtml: "The site, which you're enjoying right now, has been rewritten from Jinja to Vue to <a href=\"https://svelte.dev/\">Svelte</a> (with <a href=\"https://sapper.svelte.dev/\">Sapper</a>) across its lifetime.",
		colorBackground: "#FF3E00",
		colorForeground: "#FFF0C8",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/svelte.svg",
	},
	{
		title: "Firebase",
		descriptionHtml: "This site is Built with <a href=\"https://firebase.google.com/\">Firebase</a>, and deployed with <a href=\"https://firebase.google.com/products/hosting/\">Hosting</a> for static assets and <a href=\"https://firebase.google.com/products/functions/\">Cloud Functions</a> for server side rendering. <br /> The free <a href=\"https://firebase.google.com/pricing\">Spark Plan</a> is enough for our needs.",
		colorBackground: "#FFA000",
		colorForeground: "#FFEFCB",
		colorForegroundAccent: "#FFFFFF",
		image: "/technology/firebase.svg",
	},
	{
		title: "GitHub",
		descriptionHtml: `The code that powers ${SITE_NAME} is available in a <a href="${REPOSITORY}">GitHub repository</a>, where contributions are welcome! It’s also AGPL (Affero General Public License) 3 licensed, with modification instructions provided in the README.`,
		colorBackground: "#DCEEFE",
		colorForeground: "#4A5568",
		colorForegroundAccent: "#1A202C",
		image: "/technology/github.svg",
	},
];
