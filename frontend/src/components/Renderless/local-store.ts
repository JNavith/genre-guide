
import { Writable, writable } from "svelte/store";

interface StoreAndOnStorage<T> {
	store: Writable<T>;
	onStorage: ({ key: eventKey }: StorageEvent) => void;
}

// https://higsch.me/2019/06/22/2019-06-21-svelte-local-storage/
export default <T,>(key: string, initial: T): StoreAndOnStorage<T> => {
	const { set: setStore, ...readableStore } = writable<T>(initial);

	// Set both the localStorage and this Svelte store
	const set = (value: T): void => {
		setStore(value);
		localStorage.setItem(key, JSON.stringify(value));
	};

	// Synchronize the Svelte store and local storage
	const getAndSetFromLocalStorage = (): void => {
		const localValue = localStorage.getItem(key);

		if (localValue === null) set(initial);
		else try {
			setStore(JSON.parse(localValue));
		} catch {
			set(initial);
		}
	};

	getAndSetFromLocalStorage();

	return {
		store: { ...readableStore, set },
		onStorage({ key: eventKey }: StorageEvent): void {
			if (eventKey === key) getAndSetFromLocalStorage();
		},
	};
};
