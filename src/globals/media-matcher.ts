import { readable, Readable } from "svelte/store";

// eslint-disable-next-line consistent-return
export default (query: string): Readable<boolean> => readable<boolean>(false, (set) => {
	// @ts-ignore
	if (process.browser) {
		const mediaQueryList: MediaQueryList = window.matchMedia(query);
		set(mediaQueryList.matches);

		const handler = (options: { matches: boolean }): void => {
			set(options.matches);
		};

		mediaQueryList.addListener(handler);
		return () => mediaQueryList.removeListener(handler);
	}
});
