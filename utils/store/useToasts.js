import { create } from "zustand";
import { createStoreActions } from "./utils/createStore";

export const useToasts = create((set, get) => ({
    toasts: [],
    addToast: (toast, context = '') => {
        toast.context =     
        set({ toasts: [...get().toasts, toast] });
    },
    removeToast: (toast) => {
        set({ toasts: get().toasts.filter(t => t !== toast) });
    },
    addFromError: (error, context = ''  ) => {
        console.warn(error, context);
        if (error.code === "23505" || error.code === "23502") return;
        get().addToast({ message: error.details || error.hint || error.message || 'שגיאה בשמירה', type: 'error', context });
    },
}));

export const toastsActions = createStoreActions(useToasts);