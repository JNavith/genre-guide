<script>
  import { stores } from "@sapper/app";

  import { routes, name as siteName } from "site";

  import { send, receive } from "./_navigation-bar-crossfade";
  import SettingsTopLevel from "./_Settings.svelte";

  const { page } = stores();
</script>

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
<nav
  class="flex items-center justify-between py-3 sm:py-4 md:py-6"
  role="navigation"
  in:receive={{ key: 'nav' }}
  out:send={{ key: 'nav' }}>

  <!-- Left side: site name -->
  <div class="mr-2">

    <a
      class="block ml-3 text-lg font-medium border-b-2 border-transparent
      sm:ml-4 md:ml-6 sm:text-xl md:text-2xl font-heading
      light-theme:text-green-500 light-theme:hover:text-green-600
      dark-theme:text-green-400 dark-theme:hover:text-green-300
      hover:border-current focus:border-current"
      href="/"
      title="{siteName} homepage"
      aria-current={$page.path === '/' ? 'page' : undefined}
      rel="prefetch">

      <span
        class="inline-block"
        in:receive={{ key: 'site-name' }}
        out:send={{ key: 'site-name' }}>
        {siteName}
      </span>

      <span
        class="inline-block opacity-50"
        in:receive={{ key: 'site-name-modifier' }}
        out:send={{ key: 'site-name-modifier' }}>
        (beta)
      </span>
    </a>
  </div>

  <!-- Right side -->
  <div
    class="flex items-center ml-2"
    in:receive={{ key: 'right-nav' }}
    out:send={{ key: 'right-nav' }}>

    {#each Object.entries(routes) as [smallTitle, { route, description }]}
      <a
        class="block mr-3 border-b-2 border-transparent sm:mr-4 md:mr-6 text-md
        sm:text-lg md:text-xl font-heading light-theme:text-green-500
        light-theme:hover:text-green-600 dark-theme:text-green-400
        dark-theme:hover:text-green-300 hover:border-current
        focus:border-current"
        href={route}
        title={description}
        aria-current={$page.path === route ? 'page' : undefined}
        rel="prefetch">
        {smallTitle}
      </a>
    {/each}

    <div
      class="relative"
      in:receive={{ key: 'settings-button' }}
      out:send={{ key: 'settings-button' }}>

      <SettingsTopLevel />
    </div>
  </div>
</nav>
