<!--
    genre.guide - Binary renderless Svelte component
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
	export let options: [any, any] = [false, true];

	export let initial: any = undefined;
	export let state: any = initial;

	let asBit: number = options.indexOf(state);
	$: if (asBit !== -1) state = options[asBit];

	export let asBoolean: boolean | undefined = undefined;
	$: if (asBit !== -1) asBoolean = asBit === 0 ? false : true;

	export const toggle = (): void => {
		asBit = 1 - asBit;
	};
	export const turnOn = (): void => {
		asBit = 1;
	};
	export const turnOff = (): void => {
		asBit = 0;
	};
</script>

<slot {asBoolean} {state} {toggle} {turnOn} {turnOff} />
