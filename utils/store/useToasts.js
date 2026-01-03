import { create } from "zustand";
import { createStoreActions } from "./utils/createStore";

export const useToasts = create((set, get) => ({
    toasts: [],
    addToast: (toast) => {
        set({ toasts: [...get().toasts, toast] });
    },
    removeToast: (toast) => {
        set({ toasts: get().toasts.filter(t => t !== toast) });
    },
    addFromError: (error) => {
        if (error.code === "23505" || error.code === "23502" || error.code === "PGRST116") return ;
        console.warn(error)
        get().addToast({ message: error.details || error.hint || error.message || 'An unknown error occurred', type: 'error' });
        throw error;
    },
}));

export const toastsActions = createStoreActions(useToasts);