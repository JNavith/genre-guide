
import { writable, Readable } from "svelte/store";

export default (query: string): [Readable<boolean>, () => void] => {
	const mediaQueryList: MediaQueryList = window.matchMedia(query);
	const { set: setMatches, ...matches } = writable(mediaQueryList.matches);

	const handler = (options: { matches: boolean }): void => {
		setMatches(options.matches);
	};
	mediaQueryList.addListener(handler);

	return [matches, () => mediaQueryList.removeListener(handler)];
};
