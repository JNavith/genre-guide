<!--
    genre.guide - Track missing art Svelte component
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


<script>
  export let foregroundColor;
  export let backgroundColor;
</script>

<!-- Attribution: Heroicons UI (by Steve Schoger) -- MIT license -->
<!-- https://github.com/sschoger/heroicons-ui -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 32 32">
  <rect fill={backgroundColor} x="-4" y="-4" width="32" height="32" />
  <path
    fill={foregroundColor}
    class="heroicon-ui"
    d="M8 14.54V6a1 1 0 0 1 .76-.97l12-3A1 1 0 0 1 22 3v12a4 4 0 1
    1-2-3.46V4.28l-10 2.5V18a4 4 0 1 1-2-3.46zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0
    4zm12-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
</svg>
