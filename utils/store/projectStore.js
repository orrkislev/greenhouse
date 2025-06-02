import { create } from "zustand";

export const useProject = create((set) => ({
    project: {},
    view: 'intentions',

    setProject: (newProjectData) => set(prev => ({
        ...prev,
        project: {
            ...prev.project,
            ...newProjectData,
        }
    })),
    setView: (view) => set({ view }),
}));