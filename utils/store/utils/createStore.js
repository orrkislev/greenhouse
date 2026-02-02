import { create } from "zustand";
import { useEffect } from "react";
import { useUser } from "@/utils/store/useUser";

export function createStore(dataFn) {

    let storeRef;
    
    const withUser = (fn) => {
        return async (...args) => {
            const user = useUser.getState().user;
            if (!user) return;
            return fn(user, ...args);
        };
    };

    const withLoadingCheck = (loadFn) => {
        return async (...args) => {
            const user = useUser.getState().user;
            if (!user) return

            const state = storeRef.getState();
            if (state.loadedForUser === user.id) return;
            if (state.loading) return;

            storeRef.setState({ loadedForUser: user.id, loading: true });

            try {
                await loadFn(user, ...args);
            } catch (error) {
                throw error;
            } finally {
                storeRef.setState({ loading: false });
            }
        };
    };

    const useStore = create((set, get) => ({
        loadedForUser: null,
        loading: null,

        ...dataFn(set, get, withUser, withLoadingCheck),
    }));

    storeRef = useStore;
    const actions = createStoreActions(useStore);

    return [useStore, actions];
}

export function createStoreActions(store) {
    return Object.fromEntries(
        Object.entries(store.getState()).filter(([key, value]) => typeof value === 'function')
    );
}

export function createDataLoadingHook(store, dataKey, loadAction) {
    return function useStoreData() {
        const user = useUser(state => state.user);
        const data = store(state => state[dataKey]);

        useEffect(() => {
            if (!user?.id) return;
            const storeState = store.getState();
            if (storeState[loadAction]) {
                storeState[loadAction]();
            }
        }, [user?.id, store, loadAction]);

        return data;
    };
}