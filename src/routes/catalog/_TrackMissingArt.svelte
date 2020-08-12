<script>
	import { MusicIcon } from "svelte-feather-icons";

	export let foregroundColor: string;
	export let backgroundColor: string;

	export let size: number;
</script>

<div
	class="flex items-center justify-center"
	style="color: {foregroundColor}; background-color: {backgroundColor}; height: {size}px;
	width: {size}px;">

	<MusicIcon size={((3 / 4) * size).toString()} />
</div>
