<script>
  import { onMount } from "svelte";
  import { sineIn, sineOut, sineInOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { writable } from "svelte/store";
  import { SettingsIcon } from "svelte-feather-icons";
  import { localStorageStore } from "../stores.js";
  import { fadeSlide } from "../transitions.js";
  import RenderlessDropdown from "./Renderless/Dropdown.svelte";

  const KEY_ENTER = 13;

  let close;
  let toggle;

  const toggleTheme = () => ($theme = $theme === "light" ? "dark" : "light");
  const toggleThemeUsesOS = () => ($themeUsesOS = !$themeUsesOS);

  // Backup values
  let theme = writable("light");
  let themeUsesOS = writable(true);

  let osSupportsThemes = true;

  // Only run in the browser
  if (process.browser) {
    // Use light theme by default
    theme = localStorageStore("settings.theme", "light");

    // Take the theme from the OS by default
    themeUsesOS = localStorageStore("settings.theme.usesOS", true);
  }

  // Listen to theme changes
  $: if (process.browser) {
    // Check the user's OS's theme
    const prefersLight = matchMedia("(prefers-color-scheme: light)");
    const prefersDark = matchMedia("(prefers-color-scheme: dark)");

    // Initial page load check
    if (prefersLight.matches) {
      osSupportsThemes = true;
      if ($themeUsesOS) $theme = "light";
    } else if (prefersDark.matches) {
      osSupportsThemes = true;
      if ($themeUsesOS) $theme = "dark";
    } else {
      // If neither matches, it's because there is no support provided by the OS (I think)
      osSupportsThemes = false;
      $themeUsesOS = false;
    }

    // Listen for changes
    prefersLight.addListener(event => {
      if (event.matches && $themeUsesOS) $theme = "light";
    });
    prefersDark.addListener(event => {
      if (event.matches && $themeUsesOS) $theme = "dark";
    });
  }

  // Update the root HTML object's classes when the theme changes
  $: if (process.browser) {
    let classToReplace = null;

    document.documentElement.classList.forEach(className => {
      if (className.startsWith("theme-")) {
        classToReplace = className;
      }
    });

    // Replace the theme class
    if (classToReplace !== null) {
      document.documentElement.classList.replace(
        classToReplace,
        `theme-${$theme}`
      );
    }
    // Or add a new theme class (when one isn't present)
    else {
      document.documentElement.classList.add(`theme-${$theme}`);
    }
  }

  export let segment;
</script>

<svelte:window on:click={close} on:storage={theme.onStorage} />
<svelte:body class={'theme:' + $theme} />

<RenderlessDropdown let:close let:isOpen let:toggle>
  <div
    title="Settings"
    class={'block mr-3 sm:mr-4 md:mr-6 h-3 md:h-4 w-3 md:w-4 flex-shrink-0 hover:cursor-pointer ' + (segment !== 'about' ? 'theme-light:text-green-500 theme-light:hover:text-green-600 theme-dark:text-green-400 theme-dark:hover:text-green-300' : 'text-white')}
    on:click|stopPropagation={toggle}
    on:keydown={event => {
      if (event.keyCode == KEY_ENTER) {
        toggle();
      }
    }}
    tabindex="0">
    <SettingsIcon />
  </div>

  {#if isOpen}
    <ul
      in:fadeSlide={{ opacityDuration: 250, opacityEasing: sineIn, translateYPercent: -200, transformDuration: 120, transformEasing: sineOut }}
      out:fadeSlide={{ opacityDuration: 250, opacityEasing: sineOut, translateYPercent: -100, transformDuration: 120, transformEasing: sineOut }}
      class="absolute top-0 right-0 z-10 whitespace-no-wrap mr-3 sm:mr-4 md:mr-6
      mt-6 px-3 py-2 theme-light:bg-gray-100 theme-light:text-gray-700
      theme-dark:bg-gray-800 theme-dark:text-gray-400 font-heading list-none
      rounded shadow-md"
      on:click|stopPropagation>

      <li
        class={'flex justify-between items-center ' + (osSupportsThemes ? '' : 'cursor-not-allowed opacity-50')}
        title={osSupportsThemes ? '' : 'This option is disabled because your operating system or web browser does not support theming. Instead, set your theme manually with the switch below'}>

        {#if osSupportsThemes}
          <span
            class="lowercase"
            title={'Your theme on this website will automatically update to match the one your operating system uses'}>
            Use OS theme
          </span>
        {:else}
          <span class="lowercase">Use OS theme</span>
        {/if}
        <!-- Toggle using the OS theme on click -->
        <div
          class="ml-2 w-10 h-5 rounded-full"
          on:click={event => {
            if (osSupportsThemes) toggleThemeUsesOS();
          }}
          on:keydown={event => {
            if (osSupportsThemes && event.keyCode == KEY_ENTER) toggleThemeUsesOS();
          }}
          tabindex="0"
          title={$themeUsesOS ? 'on' : 'off'}>

          {#each ['off', 'on'] as particularOptionOuter}
            <div
              class={'rounded-full w-10 h-5 absolute transition-opacity ' + (osSupportsThemes ? 'cursor-pointer ' : 'cursor-not-allowed ') + (particularOptionOuter === 'off' ? 'bg-gray-400 ' : 'bg-green-500 ') + ($themeUsesOS == (particularOptionOuter === 'on') ? 'opacity-100' : 'opacity-0')}>

              {#each ['off', 'on'] as particularOptionInner}
                <div
                  class={'block w-3 h-3 ml-1 mt-1 rounded-full absolute left-0 top-0 transition-all ' + (particularOptionInner === 'off' ? 'bg-white ' : 'bg-white ') + (!$themeUsesOS ? (particularOptionInner == 'off' ? 'mr-6 opacity-100' : 'mr-6 opacity-0') : particularOptionInner == 'off' ? 'ml-6 opacity-0' : 'ml-6 opacity-100')} />
              {/each}
              <!-- Need an empty div that the inner part of the button can have a right margin against -->
              <div />
            </div>
          {/each}
        </div>
      </li>

      <li
        class={'flex justify-between items-center mt-2 transition-opacity ' + ($themeUsesOS ? 'cursor-not-allowed opacity-50' : '')}
        title={$themeUsesOS ? "The theme cannot be changed while 'use os theme' is on because it would have no effect. Disable it to be able to manually change the theme" : ''}>
        <span class="lowercase ">Theme</span>
        <!-- Switch themes on click -->
        <div
          class="ml-2 w-10 h-5 rounded-full"
          on:click={() => {
            if (!$themeUsesOS) toggleTheme();
          }}
          on:keydown={event => {
            if (!$themeUsesOS && event.keyCode == KEY_ENTER) toggleTheme();
          }}
          tabindex="0"
          title={$theme}>

          {#each ['light', 'dark'] as particularThemeOuter}
            <div
              class={'rounded-full w-10 h-5 absolute transition-opacity ' + ($themeUsesOS ? 'cursor-not-allowed ' : 'cursor-pointer ') + (particularThemeOuter === 'light' ? 'bg-gradient-t-teal-200-blue-400 ' : 'bg-gradient-t-indigo-700-purple-900 ') + ($theme == particularThemeOuter ? 'opacity-100' : 'opacity-0')}>

              {#each ['light', 'dark'] as particularThemeInner}
                <div
                  class={'block w-3 h-3 ml-1 mt-1 rounded-full absolute left-0 top-0 transition-all ' + (particularThemeInner === 'light' ? 'bg-radial-yellow-400-orange-300 ' : 'bg-radial-gray-100-gray-200 ') + ($theme === 'light' ? (particularThemeInner == 'light' ? 'mr-6 opacity-100' : 'mr-6 opacity-0') : particularThemeInner == 'light' ? 'ml-6 opacity-0' : 'ml-6 opacity-100')} />
              {/each}
              <!-- Need an empty div that the inner part of the button can have a right margin against -->
              <div />
            </div>
          {/each}
        </div>
      </li>

    </ul>
  {/if}
</RenderlessDropdown>
