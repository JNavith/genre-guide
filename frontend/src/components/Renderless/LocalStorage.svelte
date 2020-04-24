<!--
    genre.guide - localStorage renderless Svelte component
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
	import localStore from "./local-store";

	export let key: string;
	export let initial: any;

	// @ts-ignore
	const storeAndOnStorage = localStore(key, initial);

	// @ts-ignore
	export const store = storeAndOnStorage.store;
	// @ts-ignore
	export const onStorage = storeAndOnStorage.onStorage;
</script>

<svelte:window on:storage={onStorage} />
