
import { writable, Writable } from "svelte/store";

// https://higsch.me/2019/06/22/2019-06-21-svelte-local-storage/
export default <Item>(key: string, initial: Item): [Writable <Item>, () => void] => {
	const { set: setStore, ...readableStore } = writable<Item>(initial);

	// Set both the localStorage and this Svelte store
	const set = (value: Item): void => {
		setStore(value);
		localStorage.setItem(key, JSON.stringify(value));
	};

	// Synchronize the Svelte store and local storage
	const getAndSetFromLocalStorage = (): void => {
		const localValue = localStorage.getItem(key);

		if (localValue === null) set(initial);
		else {
			try {
				setStore(JSON.parse(localValue));
			} catch {
				set(initial);
			}
		}
	};

	// Immediately fill it up with the current value
	getAndSetFromLocalStorage();

	const updateFromStorageEvents = ({ key: eventKey }: StorageEvent): void => {
		if (eventKey === key) getAndSetFromLocalStorage();
	};
	window.addEventListener("storage", updateFromStorageEvents);

	return [
		{ ...readableStore, set },
		() => window.removeEventListener("storage", updateFromStorageEvents),
	];
};
