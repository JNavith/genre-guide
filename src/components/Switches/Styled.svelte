<script>
  export let state: boolean = false;
  export let disabled: boolean;

  const toggle = () => {
    state = !state;
  };
</script>

<!--
    genre.guide - Styled switch Svelte component
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
<button
  class="ml-2 w-10 h-5 rounded-full relative"
  on:click={toggle}
  title={state ? 'true' : undefined}
  aria-pressed={state}
  {disabled}>

  {#each [false, true] as outer}
    <div
      class="rounded-full w-10 h-5 transition-opacity absolute inset-0 {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      {outer ? 'bg-green-500' : 'bg-gray-400'}
      {state === outer ? 'opacity-100' : 'opacity-0'}">

      {#each [false, true] as inner}
        <div
          class="block w-3 h-3 ml-1 mt-1 rounded-full absolute inset-0 left-0
          top-0 transition-all bg-white {state ? 'ml-6' : 'mr-6'}
          {inner === state ? 'opacity-100' : 'opacity-0'}" />
      {/each}

      <!-- Need an empty div that the inner part of the buttstate can have a right margin against -->
      <div />
    </div>
  {/each}
</button>
