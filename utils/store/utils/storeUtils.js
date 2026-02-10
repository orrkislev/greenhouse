import { useEffect } from "react";
import { useUser } from "@/utils/store/useUser";

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


export const withUser = (fn) => {
    return async (...args) => {
        const user = useUser.getState().user;
        if (!user) return;
        return fn(user, ...args);
    };
};
