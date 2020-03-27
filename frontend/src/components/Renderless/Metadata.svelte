<!--
    genre.guide - Metadata renderless Svelte component
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
-->

<script lang="typescript">
	// @ts-ignore
	import {
		author as siteAuthor,
		name as siteName,
	} from "../../globals/site";

	export let pageTitle: string | undefined = undefined;
	export let title: string =
		pageTitle === undefined ? siteName : `${pageTitle} - ${siteName}`;

	export let description: string | undefined = undefined;

	export let author: string = siteAuthor;

	export let image: string = "/img/1x1-logo.png";
	export let imageAlt: string = siteName;

	// @ts-ignore
	let metaTags: any;

	$: metaTags = {
		"twitter:site": siteName,

		"og:title": title,
		"twitter:title": title,

		...(description
			? {
					"og:description": description,
					"twitter:description": description
			  }
			: {}),

		"author": author,
		"twitter:creator": author,

		"og:image": image,
		"twitter:image": image,

		"twitter:image:alt": imageAlt
	};
</script>

<svelte:head>
	<title>{title}</title>

	{#each Object.entries(metaTags) as [property, content]}
		<meta {property} {content} />
	{/each}
</svelte:head>
