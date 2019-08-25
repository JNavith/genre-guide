<script>
  import { onMount } from "svelte";
  import * as sapper from "@sapper/app";

  onMount(() => sapper.goto("/catalog"));
</script>
