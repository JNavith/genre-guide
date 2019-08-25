import { readable, writable } from "svelte/store";

// https://higsch.me/2019/06/22/2019-06-21-svelte-local-storage/
export const localStorageStore = (key, initial) => {
  const store = writable(initial);

  // Update the store if the key is already present
  const getAndSetFromLocalStorage = () => {
    const storeValue = localStorage.getItem(key);

    const setInitial = () => {
      store.set(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    };

    if (storeValue === undefined || storeValue === null) {
      setInitial();
    } else {
      try {
        store.set(JSON.parse(storeValue));
      } catch {
        setInitial();
      }
    }
  };

  getAndSetFromLocalStorage();

  store.subscribe(value => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return {
    ...store,
    onStorage: event => {
      if (event.key === key) {
        getAndSetFromLocalStorage();
      }
    }
  };
};

export const siteName = readable("genre.guide");
