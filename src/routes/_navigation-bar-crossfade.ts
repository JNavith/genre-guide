import { crossfade } from "svelte/transition";

import {
	easingFunctions,
	transitionDurations,
	transitionFunctions,
	// @ts-ignore -- need to write types for it
} from "design-system/index";

const { smoother: { inOut } } = easingFunctions;
const { medium } = transitionDurations;
const { fade } = transitionFunctions;

export const [send, receive] = crossfade({
	delay: 0,
	duration: medium,
	easing: inOut,
	fallback: fade,
});
