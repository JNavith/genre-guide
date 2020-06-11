<!--
    genre.guide - Top level navigation bar Svelte component
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
  import SettingsTopLevel from "./_Settings.svelte";
  import { routes, name as siteName } from "../globals/site";
</script>

<nav class="flex justify-between items-center py-3 sm:py-4 md:py-6">
  <!-- Left side: site name -->
  <div class="mr-2">
    <a
      class="block ml-3 sm:ml-4 md:ml-6 text-lg sm:text-xl md:text-2xl
      font-heading font-medium light-theme:text-green-500
      light-theme:hover:text-green-600 dark-theme:text-green-400
      dark-theme:hover:text-green-300"
      href="/"
      title="{siteName} homepage"
      rel="prefetch">
      <span>{siteName}</span>
      <span class="opacity-50">(beta)</span>
    </a>
  </div>

  <!-- Right side -->
  <div class="ml-2 flex items-center">
    {#each Object.entries(routes) as [smallTitle, { route, description }]}
      <a
        class="block mr-3 sm:mr-4 md:mr-6 text-md sm:text-lg md:text-xl
        font-heading light-theme:text-green-500 light-theme:hover:text-green-600
        dark-theme:text-green-400 dark-theme:hover:text-green-300"
        href={route}
        title={description}
        rel="prefetch">
        {smallTitle}
      </a>
    {/each}

    <div class="relative">
      <SettingsTopLevel />
    </div>
  </div>
</nav>
