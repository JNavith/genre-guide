import { crossfade } from "svelte/transition";

import {
	easingFunctions,
	transitionDurations,
	transitionFunctions,
	// @ts-ignore
} from "../globals/design-system";

const { smoother: { inOut } } = easingFunctions;
const { medium: { default: defaultMedium } } = transitionDurations;
const { fade } = transitionFunctions;

export const [send, receive] = crossfade({
	delay: 0,
	duration: defaultMedium,
	easing: inOut,
	fallback: fade,
});
